/****************************************************************
 * Fracpay server instruction enum         
 * blairmunroakusa@.0322.anch.AK		
 ****************************************************************/

#![allow(non_snake_case)]

pub enum FracpayInstruction {

    // instruction to create operator main account
    CreateMAIN {

        bumpMAIN: u8,
        seedMAIN: Vec<u8>,
        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
    },

    // instruction to create piece main account
    CreatePIECE {

        bumpPIECE: u8,
        seedPIECE: Vec<u8>,
        bumpREF: u8,
        seedREF: Vec<u8>,
        PIECEslug: Vec<u8>,
    },

    // instruction to create piece ref account
    CreateREF {

        bumpREF: u8,
        seedREF: Vec<u8>,
        REFslug: Vec<u8>,
    },

    // instruction to initialize piece account
    InitPIECE {

        invite: u8,
    },

    // instruction to initialize ref account
    InitREF {

        invite: u8,
        selfseed: u8,
        fract: u32,
    },

    // instruction to fracpay piece account
    FracpayPIECE {

        bumpREF: u8,
        seedREF: Vec<u8>,
        payment: u64,
    },
}


