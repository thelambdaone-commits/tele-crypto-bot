import { ValidatorListLayout } from '@solana/spl-stake-pool';
const field = ValidatorListLayout.fields.find(f => f.property === 'validators');
const valuesField = field.layout.fields.find(f => f.property === 'values');
const el = valuesField.layout.elementLayout;
let offset = 0;
for (const f of el.fields) {
  console.log(`${f.property}: offset ${offset}, span ${f.span}`);
  offset += f.span;
}
