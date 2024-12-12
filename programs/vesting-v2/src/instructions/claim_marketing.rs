use crate::error::ErrorCode;
use crate::instructions::claim_tokens::ClaimTokens;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_2022::{self, TransferChecked, ID},
};

pub fn claim_marketing(ctx: Context<ClaimTokens>) -> Result<()> {
    // Extraemos los datos inmutables al principio
    let beneficiary = ctx.accounts.vesting_account.beneficiary;
    let mint = ctx.accounts.vesting_account.mint;
    let start_time = ctx.accounts.vesting_account.start_time;
    let cliff_period = ctx.accounts.vesting_account.cliff_period;
    let vesting_period = ctx.accounts.vesting_account.vesting_period;
    let released_tokens = ctx.accounts.vesting_account.released_tokens;
    let total_tokens = ctx.accounts.vesting_account.total_tokens;

    const DECIMALS_FACTOR: u64 = 10u64.pow(9);
    // Calculamos el tiempo actual
    let now = Clock::get()?.unix_timestamp;

    // Derivamos el PDA y las semillas
    let program_id = *ctx.program_id;
    let (program_signer, bump) =
        Pubkey::find_program_address(&[b"vesting", beneficiary.as_ref()], &program_id);
    let seeds: &[&[u8]] = &[b"vesting", beneficiary.as_ref(), &[bump]];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    // Validamos que el beneficiario esté intentando reclamar desde su ATA
    let expected_ata = get_associated_token_address_with_program_id(&beneficiary, &mint, &ID);
    msg!("Validating ATA for beneficiary: {}", expected_ata);

    if ctx.accounts.token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    // Validamos que el pda_token_account es el ATA esperado del PDA
    let expected_pda_ata =
        get_associated_token_address_with_program_id(&program_signer, &mint, &ID);
    msg!("Validating ATA for PDA: {}", expected_pda_ata);

    if ctx.accounts.pda_token_account.key() != expected_pda_ata {
        return Err(ErrorCode::InvalidPdaTokenAccount.into());
    }

    if ctx.accounts.mint.key() != mint {
        return Err(ErrorCode::InvalidMint.into());
    }

    if ctx.accounts.vesting_account.beneficiary_type != 1 {
        return Err(ErrorCode::InvalidAccountType.into());
    }

    const MARKETING_INITIAL_RELEASE: u64 = 3_750_000 * DECIMALS_FACTOR; // 37 mil quinientos con 9 decimales // 25% liberados inmediatamente

    let time_since_start = now - start_time;
    let total_vested: u64;

    if now < start_time + cliff_period {
        if released_tokens >= MARKETING_INITIAL_RELEASE {
            // Si ya se retiraron los tokens iniciales y estamos antes del cliff, devolvemos un error
            return Err(ErrorCode::InitialTokensAlreadyClaimed.into());
        }
        // Antes del cliff, permitir solo el 25% inicial
        total_vested = MARKETING_INITIAL_RELEASE;
    } else if time_since_start > vesting_period {
        // Después del vesting, liberar todos los tokens
        total_vested = total_tokens;
    } else {
        // Vesting lineal después del cliff
        total_vested = MARKETING_INITIAL_RELEASE
            + ((total_tokens - MARKETING_INITIAL_RELEASE) as u128 * time_since_start as u128
                / vesting_period as u128) as u64;
    }

    // Calculamos los tokens que se pueden liberar ahora
    let releasable = total_vested - released_tokens;

    msg!("Releasable tokens: {}", releasable);

    // Actualizamos la cuenta mutable y realizamos la transferencia si es necesario
    if releasable > 0 {
        let vesting_account = &mut ctx.accounts.vesting_account; // Acceso mutable
        vesting_account.released_tokens += releasable;

        token_2022::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.pda_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.program_signer.to_account_info(),
                },
                signer_seeds,
            ),
            releasable,
            9,
        )?;
        msg!("Released {} tokens for Marketing", releasable);
    } else {
        msg!("No tokens available for release");
        return Err(ErrorCode::InsufficientTokens.into());
    }

    Ok(())
}
