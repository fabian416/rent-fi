pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("6U1EhFyn2nFpNsxD5Rf6JU1eQeRgBPPv3aET6xZkoF5F");

#[program]
pub mod vesting_v2 {

    use super::*;

    /// Inicializa una nueva cuenta de vesting.
    pub fn initialize(
        ctx: Context<Initialize>,
        cliff_duration: i64,
        beneficiary_pubkey: Pubkey,
        beneficiary_type: u8,
        mint_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::initialize::initialize(
            ctx,
            cliff_duration,
            beneficiary_pubkey,
            beneficiary_type,
            mint_pubkey,
        )
    }
    pub fn claim_team(ctx: Context<ClaimTokens>) -> Result<()> {
        instructions::claim_team::claim_team(ctx)
    }

    pub fn claim_marketing(ctx: Context<ClaimTokens>) -> Result<()> {
        instructions::claim_marketing::claim_marketing(ctx)
    }
}
