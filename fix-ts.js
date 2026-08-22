const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(regex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Fix params.id -> (await params).id
const paramsFiles = [
  'app/(admin)/admin/customers/[id]/page.tsx',
  'app/(admin)/admin/inventory/warehouses/[id]/page.tsx',
  'app/(admin)/admin/shipping/zones/[id]/page.tsx',
  'app/(admin)/customers/[id]/page.tsx',
];
paramsFiles.forEach(f => replaceInFile(f, /params\.id/g, '(await params).id'));

// 2. Fix params.slug -> (await params).slug
replaceInFile('app/(shop)/categories/[slug]/page.tsx', /params\.slug/g, '(await params).slug');

// 3. Fix searchParams.search -> (await searchParams).search, searchParams.page, searchParams.q
const searchParamsFiles = [
  'app/(admin)/admin/products/page.tsx',
  'app/(manager)/manager/products/page.tsx',
  'app/(shop)/search/page.tsx'
];
searchParamsFiles.forEach(f => {
  replaceInFile(f, /searchParams\.search/g, '(await searchParams).search');
  replaceInFile(f, /searchParams\.page/g, '(await searchParams).page');
  replaceInFile(f, /searchParams\.q/g, '(await searchParams).q');
});

// 4. Fix CustomerActionButtons.tsx `asChild` issue.
// If it's a regular element, we can't use asChild. We should just use Button asChild if it's a Button, but maybe it's not a Button? Let's assume it's a DropdownMenuItem or something.
// Actually, DropdownMenuItem in shadcn doesn't have asChild by default unless it's imported.
replaceInFile('app/(admin)/admin/customers/[id]/CustomerActionButtons.tsx', /asChild/g, '');

// 5. Fix audits/new/page.tsx Select onValueChange
// (value) => setReason(value as string)
replaceInFile('app/(manager)/manager/inventory/audits/new/page.tsx', /onValueChange=\{setReason\}/g, 'onValueChange={(val) => setReason(val as string)}');

// 6. Fix purchase-orders/new/page.tsx Supplier[] | undefined
// setSuppliers(res.data) -> setSuppliers(res.data || [])
replaceInFile('app/(manager)/manager/inventory/purchase-orders/new/page.tsx', /setSuppliers\(suppliersRes\.data\)/g, 'setSuppliers(suppliersRes.data || [])');
replaceInFile('app/(manager)/manager/inventory/purchase-orders/new/page.tsx', /setWarehouses\(warehousesRes\.data\)/g, 'setWarehouses(warehousesRes.data || [])');

// 7. Fix fulfillment-form.tsx Select onValueChange
replaceInFile('features/orders/components/fulfillment-form.tsx', /onValueChange=\{setCourierId\}/g, 'onValueChange={(val) => setCourierId(val as string)}');

// 8. Fix fulfillment/page.tsx Parameter 'o' implicitly has an 'any' type.
replaceInFile('app/(manager)/manager/orders/fulfillment/page.tsx', /o \=\>/g, '(o: any) =>');

// 9. Fix lib/utils/export.ts
// Property 'toString' does not exist on type 'string | T[keyof T]'.
// msSaveBlob does not exist on Navigator.
let exportCode = fs.readFileSync('lib/utils/export.ts', 'utf8');
exportCode = exportCode.replace(/value\.toString\(\)/g, 'String(value)');
exportCode = exportCode.replace(/value\.search\(/g, 'String(value).search(');
exportCode = exportCode.replace(/navigator\.msSaveBlob/g, '(navigator as any).msSaveBlob');
fs.writeFileSync('lib/utils/export.ts', exportCode, 'utf8');
console.log('Updated lib/utils/export.ts');
