import React from 'react';
import{Button,Notice}from'./ui';
type State={error:Error|null};
export class AppErrorBoundary extends React.Component<React.PropsWithChildren,State>{
 state:State={error:null};
 static getDerivedStateFromError(error:Error){return{error}}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('S.kosif UI boundary',error,info)}
 render(){if(!this.state.error)return this.props.children;return <main className="z-content"><div className="z-page"><h1>تعذر عرض هذا الجزء</h1><Notice tone="bad">حدث خطأ في الواجهة فقط. لم يتم حذف أو تعديل بياناتك بسبب هذا الخطأ.</Notice><pre style={{whiteSpace:'pre-wrap',fontSize:11}}>{this.state.error.message}</pre><div><Button variant="primary" onClick={()=>this.setState({error:null})}>إعادة المحاولة</Button> <Button onClick={()=>location.reload()}>إعادة تحميل التطبيق</Button></div></div></main>}}
}
