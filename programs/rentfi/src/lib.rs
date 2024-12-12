use anchor_lang::prelude::*;

declare_id!("6HD23Gh57Ezr3PJ2UmpcpiCqCE582VXe3jvpGqZXJwjv");

#[program]
pub mod rentfi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
