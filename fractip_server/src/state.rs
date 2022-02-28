#![allow(non_snake_case)]

use solana_program::{
    program_error::ProgramError,
    program_pack::{Pack, Sealed},
    pubkey::Pubkey,
};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

use std::array::TryFromSliceError;

// TODO, determine if I need the derive before each struct
// TODO, figure out if the types should be references (unlike paulxs imp)
// TODO, create embedded struct, AccountMeta?
pub struct MAIN {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub piececount: u32,
}

pub struct PIECE {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub refcount: u32,
    pub pieceslug: [u8; 67],
}

pub struct REF {
    pub flags: u16,
    pub target: Pubkey,
    pub fract: u32,
    pub netsum: u64,
    pub refslug: [u8; 20],
}

impl Sealed for MAIN {}

impl Pack for MAIN {
    const LEN: usize = 54;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, MAIN::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            piececount,
        ) = array_refs![src, 2, 32, 8, 8, 4];

        Ok( MAIN {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
            piececount: u32::from_le_bytes(*piececount),
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
        ) = mut_array_refs![dst, 2, 32, 8, 8, 4];

        let MAIN {
            flags,
            operator,
            balance,
            netsum,
            piececount,
        } = self;

        // this is confusing as fuck
        // cant I just do self.flags.to_le_bytes() for eg?
        *flags_dst = flags.to_le_bytes();
        operator_dst.copy_from_slice(operator.as_ref());
        *balance_dst = balance.to_le_bytes();
        *netsum_dst = netsum.to_le_bytes();
        *piececount_dst = piececount.to_le_bytes();
    }
}

impl Sealed for PIECE {}

impl Pack for PIECE {
    const LEN: usize = 121;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, PIECE::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            refcount,
            pieceslug,
        ) = array_refs![src, 2, 32, 8, 8, 4, 67];

        Ok( PIECE {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
            refcount: u32::from_le_bytes(*refcount),
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
            refcount_dst,
            pieceslug_dst,
        ) = mut_array_refs![dst, 2, 32, 8, 8, 4, 67];

        let PIECE {
            flags,
            operator,
            balance,
            netsum,
            refcount,
            pieceslug,
        } = self;

        // this is confusing as fuck
        // cant I just do self.flags.to_le_bytes() for eg?
        *flags_dst = flags.to_le_bytes();
        operator_dst.copy_from_slice(operator.as_ref());
        *balance_dst = balance.to_le_bytes();
        *netsum_dst = netsum.to_le_bytes();
        *refcount_dst = refcount.to_le_bytes();
            type VecInput = Vec<u8>;
            type PieceslugOutput = [u8; 67];
            let mut pieceslug_bytes: Vec<u8>;
            pieceslug_bytes = pieceslug.to_vec();
            let mut zeros: Vec<u8> = vec![0; 67 - pieceslug_bytes.len()];
            fn package_slug(vector: VecInput) -> Result<PieceslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            pieceslug_bytes.append(&mut zeros);
        *pieceslug_dst = package_slug(pieceslug_bytes).unwrap();

    }
}

impl Sealed for REF {}

impl Pack for REF {
    const LEN: usize = 66;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, REF::LEN];
        let (
            flags,
            target,
            fract,
            netsum,
            refslug,
        ) = array_refs![src, 2, 32, 4, 8, 20];

        Ok( REF {
            flags: u16::from_le_bytes(*flags),
            target: Pubkey::new_from_array(*target),
            fract: u32::from_le_bytes(*fract),
            netsum: u64::from_le_bytes(*netsum),
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
        ) = mut_array_refs![dst, 2, 32, 4, 8, 20];

        let REF {
            flags,
            target,
            fract,
            netsum,
            refslug,
        } = self;

        // this is confusing as fuck
        // cant I just do self.flags.to_le_bytes() for eg?
        *flags_dst = flags.to_le_bytes();
        target_dst.copy_from_slice(target.as_ref());
        *fract_dst = fract.to_le_bytes();
        *netsum_dst = netsum.to_le_bytes();
            type VecInput = Vec<u8>;
            type RefslugOutput = [u8; 20];
            let mut refslug_bytes: Vec<u8>;
            refslug_bytes = refslug.to_vec();
            let mut zeros: Vec<u8> = vec![0; 20 - refslug_bytes.len()];
            fn package_slug(vector: VecInput) -> Result<RefslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            refslug_bytes.append(&mut zeros);
        *refslug_dst = package_slug(refslug_bytes).unwrap();
    }
}
