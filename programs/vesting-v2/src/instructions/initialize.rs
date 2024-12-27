use crate::state::VestingAccount;
use anchor_lang::prelude::*;

// Initialize the instruction for every account
#[derive(Accounts)]
#[instruction(total_tokens: u64, cliff_duration: i64, vesting_duration: i64, beneficiary_pubkey: Pubkey, beneficiary_type: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + VestingAccount::SIZE,
        seeds = [b"vesting", beneficiary_pubkey.as_ref(), &beneficiary_type.to_le_bytes()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,
    #[account(mut)] // Make the payer mutable
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: La cuenta del mint necesita validación manual
    #[account(mut)]
    pub mint: AccountInfo<'info>, // Cambia de `Account<'info, Mint>` a `AccountInfo`
}

pub fn initialize(
    ctx: Context<Initialize>,
    cliff_duration: i64,
    vesting_duration: i64,
    beneficiary_pubkey: Pubkey,
    beneficiary_type: u8,
    mint_pubkey: Pubkey,
) -> Result<()> {
    let vesting_account = &mut ctx.accounts.vesting_account;

    vesting_account.beneficiary = beneficiary_pubkey;
    vesting_account.released_tokens = 0;
    vesting_account.start_time = Clock::get()?.unix_timestamp;
    vesting_account.cliff_period = cliff_duration;
    vesting_account.vesting_period = vesting_duration;
    vesting_account.beneficiary_type = beneficiary_type;
    vesting_account.mint = mint_pubkey;

    msg!(
        "Vesting account initialized for {:?} with type {:?} with mint {:?}",
        vesting_account.beneficiary,
        vesting_account.beneficiary_type,
        vesting_account.mint,
    );

    Ok(())
}
