use crate::state::VestingAccount;
use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut, has_one = beneficiary)]
    pub vesting_account: Account<'info, VestingAccount>, // Cuenta de almacenamiento de vesting

    #[account()] // Solo se usa para validación, no se modifica
    /// CHECK: Validación en la lógica del programa
    pub beneficiary: AccountInfo<'info>, // Beneficiario que reclama los tokens

    #[account(mut)]
    /// CHECK: Esta es la cuenta ATA del PDA. Se valida en la lógica del programa.
    pub pda_token_account: AccountInfo<'info>, // ATA del PDA

    #[account(mut)]
    /// CHECK: This is the associated token account (ATA) of the beneficiary. Validation is performed by SPL Token CPI.
    pub token_account: AccountInfo<'info>, // ATA del beneficiario

    pub token_program: Program<'info, Token2022>, // Programa SPL Token

    #[account(seeds = [b"vesting-v1", vesting_account.beneficiary.as_ref()], bump)]
    /// CHECK: This PDA is validated with seeds and bump. No additional validation required here.
    pub program_signer: AccountInfo<'info>, // PDA que actúa como autoridad

    /// CHECK: This is the mint address of the token. Validation is performed in the program logic.
    pub mint: AccountInfo<'info>, // Mint del token
}
