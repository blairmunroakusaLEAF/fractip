#![allow(non_snake_case)]

use solana_program::{
        program_error::ProgramError,
        pubkey::Pubkey,
        program_pack::{
            Pack,
            Sealed,
        },
    };

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

pub const PIECESLUG_LEN: usize = 67;
pub const REFSLUG_LEN: usize = 20;
pub const PUBKEY_LEN: usize = 32;
pub const FLAGS_LEN: usize = 2;
pub const BALANCE_LEN: usize = 8;
pub const NETSUM_LEN: usize = 8;
pub const COUNT_LEN: usize = 2;
pub const FRACT_LEN: usize = 4;
pub const SIZE_MAIN: u8 = (FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + COUNT_LEN) as u8;
pub const SIZE_PIECE: u8 = (FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + COUNT_LEN + PIECESLUG_LEN) as u8;
pub const SIZE_REF: u8 = (FLAGS_LEN + PUBKEY_LEN + FRACT_LEN + NETSUM_LEN + REFSLUG_LEN) as u8;

pub struct MAIN {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub piececount: u16,
}

pub struct PIECE {
    pub flags: u16,
    pub operator: Pubkey,
    pub balance: u64,
    pub netsum: u64,
    pub refcount: u16,
    pub pieceslug: [u8; PIECESLUG_LEN],
}

pub struct REF {
    pub flags: u16,
    pub target: Pubkey,
    pub fract: u32,
    pub netsum: u64,
    pub refslug: [u8; REFSLUG_LEN],
}

impl Sealed for MAIN {}

impl Pack for MAIN {
    const LEN: usize = FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + COUNT_LEN;
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
            balance: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
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
        *balance_dst = balance.to_le_bytes();
        *netsum_dst = netsum.to_le_bytes();
        *piececount_dst = piececount.to_le_bytes();
    }
}

impl Sealed for PIECE {}

impl Pack for PIECE {
    const LEN: usize = FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + COUNT_LEN + PIECESLUG_LEN;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, PIECE::LEN];
        let (
            flags,
            operator,
            balance,
            netsum,
            refcount,
            pieceslug,
        ) = array_refs![src, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, COUNT_LEN, PIECESLUG_LEN];

        Ok( PIECE {
            flags: u16::from_le_bytes(*flags),
            operator: Pubkey::new_from_array(*operator),
            balance: u64::from_le_bytes(*balance),
            netsum: u64::from_le_bytes(*netsum),
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
            refcount_dst,
            pieceslug_dst,
        ) = mut_array_refs![dst, FLAGS_LEN, PUBKEY_LEN, BALANCE_LEN, NETSUM_LEN, COUNT_LEN, PIECESLUG_LEN];

        let PIECE {
            flags,
            operator,
            balance,
            netsum,
            refcount,
            pieceslug,
        } = self;

        *flags_dst = flags.to_le_bytes();
        operator_dst.copy_from_slice(operator.as_ref());
        *balance_dst = balance.to_le_bytes();
        *netsum_dst = netsum.to_le_bytes();
        *refcount_dst = refcount.to_le_bytes();
        *pieceslug_dst = *pieceslug;

    }
}

impl Sealed for REF {}

impl Pack for REF {
    const LEN: usize = FLAGS_LEN + PUBKEY_LEN + FRACT_LEN + NETSUM_LEN + REFSLUG_LEN;

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
        *netsum_dst = netsum.to_le_bytes();
        *refslug_dst = *refslug;
    }
}
