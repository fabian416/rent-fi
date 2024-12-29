use anchor_lang::prelude::*;

declare_id!("8oHzDjuFH8n2oihjqqAq2Bu4L1iUMxYjMUUBcSpgJMzo");

#[program]
pub mod vesting_v3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
