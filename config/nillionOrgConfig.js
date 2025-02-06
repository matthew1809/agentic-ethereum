import dotenv from 'dotenv';
dotenv.config();

export const orgConfig = {
    orgCredentials: {
      secretKey: '687b9f335cf6ed42046e1d4ac8c0b8c6242a88c8f8fab2e4c92ffd304c99fd9b',
  orgDid: 'did:nil:testnet:nillion1lprunp40cdtrazh5g67zlevwhnf644d9xvy2kx'
    },
    nodes: [
      {
        url: 'https://nildb-zy8u.nillion.network',
        did: 'did:nil:testnet:nillion1fnhettvcrsfu8zkd5zms4d820l0ct226c3zy8u',
      },
      {
        url: 'https://nildb-rl5g.nillion.network',
        did: 'did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g',
      },
      {
        url: 'https://nildb-lpjp.nillion.network',
        did: 'did:nil:testnet:nillion167pglv9k7m4gj05rwj520a46tulkff332vlpjp',
      },
    ],
  };