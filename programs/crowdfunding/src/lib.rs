use anchor_lang::prelude::*;

declare_id!("7V821PS3Fffxt6ds74pB7PwSj5WdRX9RdwD5YcH3ZZrF");

#[program]
pub mod crowdfunding {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.admin = *ctx.accounts.user.key;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;
        if campaign.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());

        if **campaign.to_account_info().lamports.borrow() < rent_balance - amount {
            return Err(ProgramError::InsufficientFunds);
        }
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let ix: anchor_lang::solana_program::instruction::Instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount,
        );
        let result = anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
            ],
        );
        (&mut ctx.accounts.campaign).amount_donated += amount;

        result
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()],bump)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Campaign {
    name: String,
    description: String,
    amount_donated: u64,
    admin: Pubkey,
}



struct Meal {
    flowering: bool,
    mass:u64
}

const m: Meal = Meal {
    flowering:true,
    mass:10
};

enum Mealo {
    FishAndChips { chip_proportion: f64 },
    Hamburger { vegetarian: bool },
}
const ml: Mealo = Mealo::Hamburger { vegetarian: true };


fn main(){
   let Meal { flowering, mass} = m; 

    if let Mealo::Hamburger { .. } = ml {

    }
    
    for n in 0..=5{
        match n {
            1 => print!("This was 1"),
            2 => print!("this was 2"),
            3 | 4 => print!("this was 3 or 4"),
            high if high >= 5 => print!("Ok its high"),
            other => print!("This is th {other}")
        }
    }

    match ml {
            Mealo::FishAndChips { chip_proportion } if chip_proportion > 0.5 => { print!("this is greater"); 
                print!("Caught this");
            },
            other => print!("Meall of other")
    }

    match m {
        Meal {flowering:false,mass:20} => print!("trial 1"),
        _ => print!("Unable to detect")

    }

    let s =  GenericTest {first:1, second:3, third:4};
}


struct GenericTest<T>{
    first:T,
    second:T,
    third:T
}


impl GenericTest<i32>{
    pub fn new(first: i32, second:i32, third:i32, ) -> Self{
        Self {first, second, third}
   }

   pub fn all_new(&self)-> bool {
    self.first == self.second && self.second == self.third
   }

}