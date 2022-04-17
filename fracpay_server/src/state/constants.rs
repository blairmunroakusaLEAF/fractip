/****************************************************************
 * Fracpay server global constants
 * blairmunroakusa@.0322.anch.AK
 ****************************************************************/

pub const PIECESLUG_LEN: usize = 67;
pub const REFSLUG_LEN: usize = 20;
pub const PUBKEY_LEN: usize = 32;
pub const FLAGS_LEN: usize = 2;
pub const BALANCE_LEN: usize = 8;
pub const NETSUM_LEN: usize = 8;
pub const LEFT_LEN: usize = 8;
pub const COUNT_LEN: usize = 2;
pub const FRACT_LEN: usize = 4;
pub const SIZE_MAIN: u8 = (FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + COUNT_LEN) as u8; 
    // 52 bytes
pub const SIZE_PIECE: u8 = (FLAGS_LEN + PUBKEY_LEN + BALANCE_LEN + NETSUM_LEN + LEFT_LEN + COUNT_LEN + PIECESLUG_LEN) as u8;
    // 127 bytes
pub const SIZE_REF: u8 = (FLAGS_LEN + PUBKEY_LEN + FRACT_LEN + NETSUM_LEN + REFSLUG_LEN) as u8;
    // 66 bytes
