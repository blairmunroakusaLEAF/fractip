/****************************************************************
 * Fracpay server error handling                    			*
 * blairmunroakusa@.0322.anch.AK			                	*
 ****************************************************************/

use thiserror::Error;

use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum FracpayError {
    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,
    /// Not Rent Exempt
    #[error("Not Rent Exempt")]
    NotRentExempt,
    /// Expected Amount Mismatch
    #[error("Expected Amount Mismatch")]
    ExpectedAmountMismatch,
    /// Amount Overflow
    #[error("Amount Overflow")]
    AmountOverflow,
    /// Try From Slice
    #[error("Try From Slice Fail")]
    TryFromSliceError,
    /// Account Creation Attempt Fail
    #[error("Account Creation Attempt Fail")]
    AccountCreationAttemptError,
}

impl From<FracpayError> for ProgramError {
    fn from(error: FracpayError) -> Self {
        ProgramError::Custom(error as u32)
    }
}
