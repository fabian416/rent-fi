pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("F1RHqKoZ8exesFaiip8qos6smpfiHv3AdUCpeJLWtK4C");

#[program]
pub mod cliff_vesting {

    use super::*;

    /// Inicializa una nueva cuenta de vesting.
    pub fn initialize(
        ctx: Context<Initialize>,
        total_tokens: u64,
        cliff_duration: i64,
        vesting_duration: i64,
        beneficiary_pubkey: Pubkey,
        beneficiary_type: u8,
        mint_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::initialize::initialize(
            ctx,
            total_tokens,
            cliff_duration,
            vesting_duration,
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
