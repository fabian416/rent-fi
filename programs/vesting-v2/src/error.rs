use std::ffi::FromBytesUntilNulError;

use anchor_lang::prelude::*;

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
    #[msg("0 Tokens to claim.")]
    NoTokensToClaim,
    #[msg("First unlock already claimed.")]
    FirstUnlockAlreadyClaimed,
    #[msg("Unlock time did not finish.")]
    LockTimeNotFinished,
}
