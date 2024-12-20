use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_2022::{self, TransferChecked, ID},
};

pub fn claim_dao(ctx: Context<ClaimTokens>) -> Result<()> {
    let beneficiary = ctx.accounts.vesting_account.beneficiary;
    let mint = ctx.accounts.vesting_account.mint;
    let start_time = ctx.accounts.vesting_account.start_time;
    let cliff_period = ctx.accounts.vesting_account.cliff_period;

    const TOTAL_TOKENS: u64 = 5_000_000;
    let now = Clock::get()?.unix_timestamp;
    let program_id = *ctx.program_id;
    // we derive PDA and the seeds
    let (program_signer, bump) =
        Pubkey::find_program_address(&[b"vesting", beneficiary.as_ref()], &program_id);
    let seeds: &[&[u8]] = &[b"vesting", beneficiary.as_ref(), &[bump]];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    let expected_ata = get_associated_token_address_with_program_id(&program_signer, &mint, &ID);
    msg!("Validating ATA and the ATA is: {}", expected_ata);

    if ctx.accounts.pda_token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidPdaTokenAccount.into());
    };

    if ctx.accounts.token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidTokenAccount.into());
    };

    if ctx.accounts.vesting_account.beneficiary_type != 3 {
        return Err(ErrorCode::InvalidBeneficiaryType.into());
    };

    let mut releasable = 0;

    msg!(
        "Releasable at the beginning of the contract is: {}",
        releasable
    );

    if now < start_time + cliff_period {
        releasable = TOTAL_TOKENS;
    }

    if releasable > 0 {
        let vesting_account = &mut ctx.accounts.vesting_account; // Acceso mutable
        vesting_account.released_tokens += releasable;

        token_2022::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.pda_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.program_signer.to_account_info(),
                },
                signer_seeds,
            ),
            releasable,
            9,
        )?;
    } else {
        msg!("No tokens to release ");
        return Err(ErrorCode::InsufficientTokens.into());
    }

    Ok(())
}
