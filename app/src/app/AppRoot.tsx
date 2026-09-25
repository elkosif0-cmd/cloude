import {ThemeProvider,useTheme} from '../design/ThemeProvider';
import {THEMES} from '../design/themes';
import type {ThemeId} from '../design/theme-contract';

export const APP_NAME = 'S.kosif';

function FoundationScreen(){
  const {theme,setTheme}=useTheme();
  return (
    <main dir="rtl" lang="ar" data-app="s-kosif" style={{minHeight:'100vh',padding:'28px',background:'var(--bg)',color:'var(--text)'}}>
      <section className="sk-surface" style={{maxWidth:1100,margin:'0 auto',padding:'28px'}}>
        <p style={{margin:0,color:'var(--muted)',fontSize:14}}>المشروع الأكبر · Clean Slate</p>
        <h1 className="sk-display" style={{margin:'8px 0 10px',fontSize:'clamp(30px,5vw,54px)'}}>{APP_NAME}</h1>
        <p style={{margin:'0 0 24px',color:'var(--muted)',maxWidth:760,lineHeight:1.9}}>بداية جديدة بالكامل: واجهة واحدة، نظام تصميم واحد، وخمس ثيمات من نفس النواة بدون أي اعتماد على واجهات S.kosif القديمة.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
          {(Object.keys(THEMES) as ThemeId[]).map((id)=><button key={id} onClick={()=>setTheme(id)} aria-pressed={theme===id} style={{border:'1px solid color-mix(in srgb,var(--text) 14%,transparent)',background:theme===id?'var(--accent)':'var(--surface)',color:theme===id?'white':'var(--text)',padding:'10px 14px',cursor:'pointer'}}>{THEMES[id].label}</button>)}
        </div>
      </section>
    </main>
  );
}

export function AppRoot(){
  return <ThemeProvider><FoundationScreen/></ThemeProvider>;
}
