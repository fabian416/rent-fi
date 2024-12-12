use crate::state::VestingAccount;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]

pub struct ClaimTokens<'info> {
    #[account(mut, has_one = beneficiary)]
    pub vesting_account: Account<'info, VestingAccount>, // Cuenta de almacenamiento de vesting
    #[account(mut)]
    pub beneficiary: Signer<'info>, // Beneficiario que reclama los tokens
    #[account(mut)]
    /// CHECK: Esta cuenta es una cuenta SPL Token. Se valida a través del programa SPL Token durante CPI.
    pub token_account: AccountInfo<'info>, // Cuenta donde se enviarán los tokens
    pub token_program: Program<'info, Token>, // Programa SPL Token
    #[account(seeds = [b"vesting", vesting_account.beneficiary.as_ref()], bump)]
    /// CHECK: Este PDA está validado con seeds y bump. No necesita validación adicional aquí.
    pub program_signer: AccountInfo<'info>, // PDA que actúa como autoridad
    /// CHECK: Validación manual del mint.
    pub mint: AccountInfo<'info>, // Mint del token
}
