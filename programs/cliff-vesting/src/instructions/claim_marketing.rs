use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

pub fn claim_marketing(ctx: Context<ClaimTokens>) -> Result<()> {
    let vesting_account = &mut ctx.accounts.vesting_account;
    let total_tokens = vesting_account.total_tokens;

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
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_account.to_account_info(),
                    to: ctx.accounts.beneficiary.to_account_info(),
                    authority: ctx.accounts.program_signer.to_account_info(),
                },
            ),
            releasable,
        )?;
        msg!("Released {} tokens for Marketing", releasable);
    } else {
        msg!("No tokens available for release");
    }

    Ok(())
}
