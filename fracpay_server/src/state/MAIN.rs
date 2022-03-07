/****************************************************************
 * Fracpay server MAIN state implementation   
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/
#![allow(non_snake_case)]

use solana_program::{
        program_error::ProgramError,
        pubkey::Pubkey,
        program_pack::{
            Pack,
            Sealed,
        },
    };

use arrayref::{
        array_mut_ref,
        array_ref,
        mut_array_refs,
        array_refs,
    };

use crate::state::constants::*;

pub struct MAIN {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub piececount: u16,
}

impl Sealed for MAIN {}

impl Pack for MAIN {
    const LEN: usize = SIZE_MAIN as usize;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, MAIN::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            piececount,
        ) = array_refs![src, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, COUNT_LEN];

        Ok( MAIN {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_be_bytes(*balance),
            netsum: u64::from_be_bytes(*netsum),
            piececount: u16::from_le_bytes(*piececount),
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, MAIN::LEN];
        let (
            flags_dst,
            operator_dst,
            balance_dst,
            netsum_dst,
            piececount_dst,
        ) = mut_array_refs![dst, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, COUNT_LEN];

        let MAIN {
            flags,
            operator,
            balance,
            netsum,
            piececount,
        } = self;

        *flags_dst = flags.to_le_bytes();
        operator_dst.copy_from_slice(operator.as_ref());
        *balance_dst = balance.to_be_bytes();
        *netsum_dst = netsum.to_be_bytes();
        *piececount_dst = piececount.to_le_bytes();
    }
}
