/* S.kosif V31: نافذة قراءة فقط على بيانات التطبيق للوحدات الخارجية.
   الكتالوج يبقى في الذاكرة حتى أول تعديل، فلا يكفي localStorage على جهاز جديد.
   تُرجع نسخة، فلا يمكن للوحدات تعديل الحالة. يُدرج داخل نطاق التطبيق عند البناء. */
window.SKosifCore = Object.freeze({
  raws: () => JSON.parse(JSON.stringify((S && Array.isArray(S.raws)) ? S.raws : [])),
});
