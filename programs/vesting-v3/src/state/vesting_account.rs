use anchor_lang::prelude::*;

// we define the structure of the Vesting Account
#[account]
pub struct VestingAccount {
    pub released_tokens: u64, // Tokens already released
    pub cliff_period: i64, // Duración del período de cliff (en segundos) Duration of the cliff period ( in seconds )
    pub start_time: i64,   // Inicio del vesting Start of the vesting
    pub beneficiary: Pubkey, // Dirección del beneficiario // Address beneficiary of the tokens
    pub beneficiary_type: u8, // Type of beneficiary (Marketing =  1, TeamDev  = 2 Dao = 3 Fund = 4 )
    pub mint: Pubkey,
}

impl VestingAccount {
    pub const SIZE: usize = 8    // Discriminante de Anchor
        + 8  // released_tokens
        + 8  // cliff_period
        + 8  // start_time
        + 32 // beneficiary (Pubkey)
        + 8  // beneficiary_type 1 bytes (u8) 
        + 32; // mint (Pubkey)
}
