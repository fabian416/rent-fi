use anchor_lang::{prelude::*, solana_program::message};

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient tokens available for release.")]
    InsufficientTokens,
    #[msg("Invalid beneficiary address.")]
    InvalidBeneficiary,
    #[msg("Invalid beneficiary address.")]
    InvalidBeneficiaryType,
    #[msg("Arithmetic overflow occurred.")]
    ArithmeticOverflow,
    #[msg("Unauthorized access.")]
    UnauthorizedAccess,
    #[msg("Invalid account type.")]
    InvalidAccountType,
    #[msg("Invalid mint public key.")]
    InvalidMint,
    #[msg("Invalid Token Account.")]
    InvalidTokenAccount,
    #[msg("Invalid PDA token Account.")]
    InvalidPdaTokenAccount,
    #[msg("initial tokens already claimed.")]
    InitialTokensAlreadyClaimed,
    #[msg("No releasable tokens to give")]
    NoReleasableTokens,
}
