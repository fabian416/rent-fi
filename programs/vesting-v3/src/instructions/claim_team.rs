use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_2022::{self, TransferChecked, ID},
};

pub fn claim_team(ctx: Context<ClaimTokens>) -> Result<()> {
    let beneficiary = ctx.accounts.vesting_account.beneficiary;
    let mint = ctx.accounts.vesting_account.mint;
    let beneficiary_type = ctx.accounts.vesting_account.beneficiary_type;

    // Verificaciones inmediatas para evitar cómputo innecesario
    if beneficiary_type != 2 {
        return Err(ErrorCode::InvalidAccountType.into());
    }

    if ctx.accounts.token_account.key()
        != get_associated_token_address_with_program_id(&beneficiary, &mint, &ID)
    {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    if ctx.accounts.mint.key() != mint {
        return Err(ErrorCode::InvalidMint.into());
    }

    let released_tokens = ctx.accounts.vesting_account.released_tokens;
    let start_time = ctx.accounts.vesting_account.start_time;
    let cliff_period = ctx.accounts.vesting_account.cliff_period;

    let now = Clock::get()?.unix_timestamp;

    let program_id = *ctx.program_id;
    let (program_signer, bump) = Pubkey::find_program_address(
        &[
            b"vesting",
            beneficiary.as_ref(),
            &beneficiary_type.to_le_bytes(),
        ],
        &program_id,
    );
    let seeds: &[&[u8]] = &[
        b"vesting",
        beneficiary.as_ref(),
        &beneficiary_type.to_le_bytes(),
        &[bump],
    ];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    // Validamos que el beneficiario esté intentando reclamar desde su ATA
    let expected_ata = get_associated_token_address_with_program_id(&beneficiary, &mint, &ID);
    msg!("Validating ATA for beneficiary: {}", expected_ata);

    if ctx.accounts.token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    // Validamos que el pda_token_account es el ATA esperado del PDA
    let expected_pda_ata =
        get_associated_token_address_with_program_id(&program_signer, &mint, &ID);
    msg!("Validating ATA for PDA: {}", expected_pda_ata);

    if ctx.accounts.pda_token_account.key() != expected_pda_ata {
        return Err(ErrorCode::InvalidPdaTokenAccount.into());
    }

    const QUARTERLY_RELEASE: u64 = 1_000_000; // Amount of toknes ot be released at the end of every quarter
    const TOTAL_VESTING_PERIOD: u64 = 24;
    const QUARTERS_IN_SECONDS: i64 = 60 * 60 * 3; // for Production const QUARTERS_IN_SECONDS: i64 = 60 * 60 * 24 * 30 * 3;

    let mut available_tokens: u64 = 0;

    if now >= start_time + cliff_period {
        // Calculate how many quarters has been passed since cliff ending
        let time_since_cliff = now - (start_time + cliff_period);
        let quarters_passed = (time_since_cliff / QUARTERS_IN_SECONDS) as u64;

        // Calculate free tokens based in  quarters completed
        let max_quarters = TOTAL_VESTING_PERIOD / 3; // 24 MONTHS  = 8 trimestres
        let vested_quarters = quarters_passed.min(max_quarters);

        available_tokens += vested_quarters * QUARTERLY_RELEASE;
    }

    // Calculamos los tokens que se pueden liberar ahora
    let releasable = available_tokens - released_tokens;

    msg!("Releasable tokens: {}", releasable);

    if releasable == 0 {
        return Err(ErrorCode::NoTokensToClaim.into());
    }

    if releasable > 0 {
        let vesting_account = &mut ctx.accounts.vesting_account; // Acceso mutable
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
            releasable * 10u64.pow(9),
            9,
        )?;
        msg!("Released {} tokens for Team Development", releasable);
    } else {
        msg!("No tokens available for release");
    }

    Ok(())
}
