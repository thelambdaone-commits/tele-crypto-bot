import { ValidatorListLayout } from '@solana/spl-stake-pool';
const el = ValidatorListLayout.fields.find(f => f.property === 'validators').layout.elementLayout;
console.log(el.fields.map(f => `${f.property}: ${f.span}`));