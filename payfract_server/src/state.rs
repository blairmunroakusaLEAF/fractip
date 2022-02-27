use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

use std::str;

// TODO, determine if I need the derive before each struct
// TODO, figure out if the types should be references (unlike paulxs imp)
// TODO, create embedded struct, AccountMeta?
pub struct MAIN {
    flags: u16,
    operator: Pubkey,
    balance: u64,
    netsum: u64,
    piececount: u32,
}

pub struct PIECE<'a> {
    flags: u16,
    operator: Pubkey,
    balance: u64,
    netsum: u64,
    refcount: u32,
    pieceslug: &'a str,
}

pub struct REF<'a> {
    flags: u16,
    target: Pubkey,
    fract: u32,
    netsum: u64,
    refslug: &'a str,
}

impl PACKING for MAIN {
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

        Ok( Main {
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

        let Main {
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

impl PACKING for PIECE<'_> {
    const LEN: usize = 121;
    const SLUG_LEN: usize = 67
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, PIECE::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            refcount,
            pieceslug,
        ) = array_refs![src, 2, 32, 8, 8, 4, PIECE::SLUG_LEN];

        Ok( Piece {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
            refcount: u32::from_le_bytes(*refcount),
            pieceslug: str::from_utf8(*pieceslug)
        })
    }
    //allen ericken

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, PIECE::LEN];
        let (
            flags_dst,
            operator_dst,
            balance_dst,
            netsum_dst,
            refcount_dst,
            pieceslug_dst,
        ) = mut_array_refs![dst, 2, 32, 8, 8, 4, PIECE::SLUG_LEN];

        let Piece {
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
            type PieceslugOutput = [u8; PIECE::SLUG_LEN];
            let mut pieceslug_bytes: Vec<u8>;
            pieceslug_bytes = pieceslug.as_bytes().to_vec();
            let mut zeros: Vec<u8> = vec![0; PIECE::SLUG_LEN - pieceslug_bytes.len()];
            fn package_slug(vector: VecInput) -> Result<PieceslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            pieceslug_bytes.append(&mut zeros);
        *pieceslug_dst = package_slug(pieceslug_bytes).unwrap();

    }
}

impl Package for REF<'_> {
    const LEN: usize = 66;
    const SLUG_LEN: usize = 20;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, REF::LEN];
        let (
            flags,
            target,
            fract,
            netsum,
            refslug,
        ) = array_refs![src, 2, 32, 4, 8, REF::SLUG_LEN];

        Ok( Ref {
            flags: u16::from_le_bytes(*flags),
            target: Pubkey::new_from_array(*target),
            fract: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
            refslug: str::from_utf8(*refslug)
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
        ) = mut_array_refs![dst, 2, 32, 4, 8, REF::SLUG_LEN];

        let Ref {
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
            type RefslugOutput = [u8; REF::SLUG_LEN];
            let mut refslug_bytes: Vec<u8>;
            refslug_bytes = refslug.as_bytes().to_vec();
            let mut zeros: Vec<u8> = vec![0; REF::SLUG_LEN - refslug_bytes.len()];
            fn package_slug(vector: VecInput) -> Result<RefslugOutput, TryFromSliceError> {
                vector.as_slice().try_into()
            }
            refslug_bytes.append(&mut zeros);
        *refslug_dst = package_slug(refslug_bytes).unwrap();
    }
}
