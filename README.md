# Steps I followed and things I learned while making this project

# Steps

## Solana Program

1. In anchor in the #[program] macro we add all the instructions we want to have in the program.
2. #[account] macro is used to define the program accounts that will be passed to the instruction.
3. Before writing programs we need to specify the program state. Here we do this by writing journalEntryState.
4. Then we need to write instruction to initialize the program state.
5. The first parameter of any instruction is the context, which is a struct that contains all the accounts that will be passed to the instruction.

