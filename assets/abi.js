// Cargar el ABI desde el archivo JSON
export const SwapEventABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        indexed: false,
        internalType: "int256",
        name: "amount0",
        type: "int256"
      },
      {
        indexed: false,
        internalType: "int256",
        name: "amount1",
        type: "int256"
      },
      {
        indexed: false,
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "liquidity",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tick",
        type: "int24"
      }
    ],
    name: "Swap",
    type: "event"
  }
];

export const LendingVaultEvents =[
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "who", type: "address" },
      { indexed: false, internalType: "uint256", name: "borrowAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "duration", type: "uint256" }
    ],
    name: "Borrow",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "who", type: "address" }
    ],
    name: "Payback",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "who", type: "address" }
    ],
    name: "RollLoan",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "totalBurned", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalLoans", type: "uint256" }
    ],
    name: "DefaultLoans",
    type: "event"
  }
];
