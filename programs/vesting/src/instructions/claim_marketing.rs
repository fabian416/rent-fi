use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_2022::{self, TransferChecked, ID},
};

pub fn claim_marketing(ctx: Context<ClaimTokens>) -> Result<()> {
    let vesting_account = &mut ctx.accounts.vesting_account;
    let total_tokens = vesting_account.total_tokens;

    // Verificar que el beneficiario esté intentando reclamar desde su ATA
    let expected_ata = get_associated_token_address_with_program_id(
        &vesting_account.beneficiary,
        &vesting_account.mint,
        &ID,
    );
    msg!("Validating ATA for beneficiary: {}", expected_ata);

    if ctx.accounts.token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }
    // Derivar el ATA esperado del PDA
    let expected_pda_ata = get_associated_token_address_with_program_id(
        &ctx.accounts.program_signer.key(),
        &vesting_account.mint,
        &ID,
    );
    msg!("Validating ATA for PDA: {}", expected_pda_ata);

    // Verificar que el pda_token_account es el ATA esperado
    if ctx.accounts.pda_token_account.key() != expected_pda_ata {
        return Err(ErrorCode::InvalidPdaTokenAccount.into());
    }

    if ctx.accounts.mint.key() != vesting_account.mint {
        return Err(ErrorCode::InvalidMint.into());
    }

    if vesting_account.beneficiary_type != 1 {
        return Err(ErrorCode::InvalidAccountType.into());
    }
    const MARKETING_INITIAL_RELEASE: u64 = 37_500_000; // 25% liberados inmediatamente

    let now = Clock::get()?.unix_timestamp;

    // Asegúrate de que el cliff ha pasado
    if now < vesting_account.start_time + vesting_account.cliff_period {
        return Err(ErrorCode::CliffNotReached.into());
    }

    // Calcula tokens totales liberados basados en el tiempo
    let time_since_start = now - vesting_account.start_time;
    let total_vested = if time_since_start > vesting_account.vesting_period {
        total_tokens
    } else {
        // Liberar proporcionalmente al tiempo transcurrido después del cliff
        MARKETING_INITIAL_RELEASE
            + ((total_tokens - MARKETING_INITIAL_RELEASE) as u128 * time_since_start as u128
                / vesting_account.vesting_period as u128) as u64
    };

    // Calcula tokens que se pueden liberar ahora
    let releasable = total_vested - vesting_account.released_tokens;

    // Libera los tokens disponibles
    if releasable > 0 {
        vesting_account.released_tokens += releasable;
        token_2022::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.pda_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.program_signer.to_account_info(),
                },
            ),
            releasable,
            9,
        )?;
        msg!("Released {} tokens for Marketing", releasable);
    } else {
        msg!("No tokens available for release");
    }
    Ok(())
}
