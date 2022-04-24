/****************************************************************
 * Fracpay server PIECE state implementation   
 * blairmunroakusa@.0322.anch.AK			  
 ****************************************************************/

#![allow(non_snake_case)]
use solana_program::{
        program_error::ProgramError,
        pubkey::Pubkey,
        program_pack::Pack,
        program_pack::Sealed,
    };
use arrayref::{
        array_mut_ref,
        array_ref,
        mut_array_refs,
        array_refs,
    };
use crate::state::constants::*;

pub struct PIECE {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub left: u64,
    pub refcount: u16,
    pub pieceslug: [u8; PIECESLUG_LEN],
}

impl Sealed for PIECE {}

impl Pack for PIECE {
    const LEN: usize = SIZE_PIECE as usize;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, PIECE::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            left,
            refcount,
            pieceslug,
        ) = array_refs![src, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, LEFT_LEN, COUNT_LEN, PIECESLUG_LEN];

        Ok( PIECE {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_be_bytes(*balance),
            netsum: u64::from_be_bytes(*netsum),
            left: u64::from_be_bytes(*left),
            refcount: u16::from_le_bytes(*refcount),
            pieceslug: *pieceslug,
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, PIECE::LEN];
        let (
            flags_dst,
            operator_dst,
            balance_dst,
            netsum_dst,
            left_dst,
            refcount_dst,
            pieceslug_dst,
        ) = mut_array_refs![dst, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, LEFT_LEN, COUNT_LEN, PIECESLUG_LEN];

        let PIECE {
            flags,
            operator,
            balance,
            netsum,
            left,
            refcount,
            pieceslug,
        } = self;

        *flags_dst = flags.to_le_bytes();
        operator_dst.copy_from_slice(operator.as_ref());
        *balance_dst = balance.to_be_bytes();
        *netsum_dst = netsum.to_be_bytes();
        *left_dst = left.to_be_bytes();
        *refcount_dst = refcount.to_le_bytes();
        *pieceslug_dst = *pieceslug;

    }
}
