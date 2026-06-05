import { ValidatorListLayout } from '@solana/spl-stake-pool';
const f = ValidatorListLayout.fields.find(f => f.property === 'validators');
const valuesLayout = f.layout.fields.find(field => field.property === 'values').layout;
console.log(valuesLayout.elementLayout.fields.map(field => `${field.property}: ${field.span}`));