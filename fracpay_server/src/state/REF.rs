/****************************************************************
 * Fracpay server REF state implementation    
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

pub struct REF {
    pub flags: u16,
    pub target: Pubkey,
    pub fract: u32,
    pub netsum: u64,
    pub refslug: [u8; REFSLUG_LEN],
}

impl Sealed for REF {}

impl Pack for REF {
    const LEN: usize = SIZE_REF as usize;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, REF::LEN];
        let (
            flags,
            target,
            fract,
            netsum,
            refslug,
        ) = array_refs![src, FLAGS_LEN, PUBKEY_LEN, FRACT_LEN, NETSUM_LEN, REFSLUG_LEN];

        Ok( REF {
            flags: u16::from_le_bytes(*flags),
            target: Pubkey::new_from_array(*target),
            fract: u32::from_le_bytes(*fract),
            netsum: u64::from_be_bytes(*netsum),
            refslug: *refslug,
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, REF::LEN];
        let (
            flags_dst,
            target_dst,
            fract_dst,
            netsum_dst,
            refslug_dst,
        ) = mut_array_refs![dst, FLAGS_LEN, PUBKEY_LEN, FRACT_LEN, NETSUM_LEN, REFSLUG_LEN];

        let REF {
            flags,
            target,
            fract,
            netsum,
            refslug,
        } = self;

        *flags_dst = flags.to_le_bytes();
        target_dst.copy_from_slice(target.as_ref());
        *fract_dst = fract.to_le_bytes();
        *netsum_dst = netsum.to_be_bytes();
        *refslug_dst = *refslug;
    }
}
