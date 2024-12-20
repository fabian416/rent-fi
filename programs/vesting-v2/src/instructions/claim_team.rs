use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_2022::{
        self, spl_token_2022::extension::interest_bearing_mint::UnixTimestamp, TransferChecked, ID,
    },
};

pub fn claim_team(ctx: Context<ClaimTokens>) -> Result<()> {
    let beneficiary = ctx.accounts.vesting_account.beneficiary;
    let mint = ctx.accounts.vesting_account.mint;
    let total_tokens = ctx.accounts.vesting_account.total_tokens;
    let start_time = ctx.accounts.vesting_account.start_time;
    let cliff_period = ctx.accounts.vesting_account.cliff_period;
    let now = Clock::get()?.unix_timestamp;

    let vesting_account: &mut Account<'_, crate::state::VestingAccount> =
        &mut ctx.accounts.vesting_account;

    if ctx.accounts.mint.key() != vesting_account.mint {
        return Err(ErrorCode::InvalidMint.into());
    }

    if vesting_account.beneficiary_type != 1 {
        return Err(ErrorCode::InvalidAccountType.into());
    }

    let vesting_account = &mut ctx.accounts.vesting_account;
    let now = Clock::get()?.unix_timestamp;

    // Calculate total vested tokens based on elapsed time
    if now < start_time + cliff_period {
        // start the logic based on if the clfiff perdio was started
    }
    let program_id = *ctx.program_id;

    let (program_signer, bump) =
        Pubkey::find_program_address(&[b"vesting", beneficiary.as_ref()], &program_id);

    let seeds: &[&[u8]] = &[b"vesting", beneficiary.as_ref(), &[bump]];

    let signer_seeds: &[&[&[u8]]] = &[seeds];

    // Validamos que el pda_token_account es el ATA esperado del PDA
    let expected_pda_ata =
        get_associated_token_address_with_program_id(&program_signer, &mint, &ID);
    msg!("Validating ATA for PDA: {}", expected_pda_ata);

    // we start the logic to determine how many tokens are gonna be realaese depednes on the time :

    // Calculate releasable tokens
    let releasable = total_tokens - vesting_account.released_tokens;

    if releasable > 0 {
        // Update released tokens
        vesting_account.released_tokens += releasable;

        // Transfer tokens to beneficiary
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
        msg!("Released {} tokens for Team Development", releasable);
    } else {
        msg!("No tokens available for release");
    }

    Ok(())
}
