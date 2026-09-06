export const getLang=()=>document.documentElement.lang==='en'?'en':'ar';
export const t=(ar,en)=>getLang()==='ar'?ar:en;
export const money=value=>new Intl.NumberFormat(getLang()==='ar'?'ar-SA':'en-SA',{style:'currency',currency:'SAR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
export const formats=[
{id:'sachet',name:{ar:'كيس واحد',en:'Single sachet'},count:1,grams:30,price:2.5},
{id:'cup',name:{ar:'كوب الرحلة',en:'Journey Cup'},count:5,grams:150,price:12},
{id:'case',name:{ar:'كرتون التجزئة',en:'Retail case'},count:24,grams:720,price:42},
{id:'family',name:{ar:'خلطة العائلة',en:'Family Mix'},count:20,grams:600,price:39}];
export const products=[
{id:'sea-salt',name:{ar:'ملح بحري',en:'Classic Sea Salt'},description:{ar:'نكهة الملح البحري. اختيار بسيط للحظاتك اليومية.',en:'The sea salt flavour. A simple choice for your everyday moments.'},note:{ar:'البداية الكلاسيكية',en:'The original mood'},color:'#335b7b',pale:'#e5e9e7',image:'./assets/sea-salt.webp'},
{id:'garlic-salt',name:{ar:'ملح بالثوم',en:'Garlic Salt'},description:{ar:'نكهة الثوم والملح. اختيار مختلف للّمة.',en:'Garlic meets salt. A different flavour to bring to the gathering.'},note:{ar:'للذوّاقة',en:'A savoury mood'},color:'#92600c',pale:'#f1e4bd',image:'./assets/garlic-salt.webp'},
{id:'pepper-lime',name:{ar:'فلفل ولايم',en:'Pepper Lime'},description:{ar:'نكهة الفلفل واللايم. غيّر طعم جلستك.',en:'Pepper and lime flavour. Change up your snack moment.'},note:{ar:'غيّر جوّك',en:'A brighter mood'},color:'#526536',pale:'#e5e8d3',image:'./assets/pepper-lime.webp'},
{id:'fire-salt',name:{ar:'ملح حار',en:'Fire Salt'},description:{ar:'نكهة الملح الحار. للّمة اللي تحب التغيير.',en:'The hot salt flavour. For a gathering that likes a little change.'},note:{ar:'لحبّ التغيير',en:'Turn up the mood'},color:'#a33f2b',pale:'#f0dcd0',image:'./assets/fire-salt.webp'},
{id:'family-mix',name:{ar:'خلطة العائلة',en:'Family Mix'},description:{ar:'أربع نكهات في عبوة واحدة. ٢٠ كيسًا مغلقًا، خمسة من كل نكهة. الوزن الصافي ٦٠٠ غ.',en:'Four flavours, one gathering. 20 sealed sachets, five of each flavour. Net contents 600 g.'},note:{ar:'لكل واحد نكهته',en:'Something for everyone'},color:'#725137',pale:'#e8dbc7',image:'./assets/family-mix.webp'}];
export const bulkUnitPrice=q=>q>=24?36:q>=12?38:q>=4?40:42;
