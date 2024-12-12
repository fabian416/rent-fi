use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

pub fn claim_team(ctx: Context<ClaimTokens>) -> Result<()> {

    let beneficiary = ctx.accounts.vesting_account.beneficiary;
    let mint = ctx.accounts.vesting_account.mint;
    let start_time = ctx.accounts.vesting_account.start_time;
    let cliff_period = ctx.accounts.vesting_account.cliff_period;
    let vesting_period = ctx.accounts.vesting_account.vesting_period;
    let released_tokens = ctx.accounts.vesting_account.released_tokens;
    let total_tokens = ctx.accounts.vesting_account.total_tokens;

    
    let vesting_account = &mut ctx.accounts.vesting_account;
    let total_tokens = vesting_account.total_tokens;

    if ctx.accounts.mint.key() != vesting_account.mint {
        return Err(ErrorCode::InvalidMint.into());
    }

    if vesting_account.beneficiary_type != 2 {
        return Err(ErrorCode::InvalidAccountType.into());
    }

    let vesting_account = &mut ctx.accounts.vesting_account;
    let now = Clock::get()?.unix_timestamp;

    // Calculate total vested tokens based on elapsed time
    let time_since_start = now - vesting_account.start_time;
    let total_vested = if time_since_start > vesting_account.vesting_period {
        total_tokens
    } else {
        (total_tokens as u128 * (time_since_start - vesting_account.cliff_period) as u128
            / vesting_account.vesting_period as u128) as u64
    };

    // Calculate releasable tokens
    let releasable = total_vested - vesting_account.released_tokens;

    if releasable > 0 {
        // Update released tokens
        vesting_account.released_tokens += releasable;

        // Transfer tokens to beneficiary
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
        msg!("Released {} tokens for Team Development", releasable);
    } else {
        msg!("No tokens available for release");
    }

    Ok(())
}
