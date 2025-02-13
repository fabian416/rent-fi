pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("FUig98Z7S6ypR69rF5yHYaWUN41Jvjm7Qnkid8fhDpB3");

#[program]
pub mod vesting_v1 {

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
    pub fn claim_dao(ctx: Context<ClaimTokens>) -> Result<()> {
        instructions::claim_dao::claim_dao(ctx)
    }
    pub fn claim_fund(ctx: Context<ClaimTokens>) -> Result<()> {
        instructions::claim_fund::claim_fund(ctx)
    }
}
