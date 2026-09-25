import {Component,type ErrorInfo,type PropsWithChildren} from 'react';
import {logClientError} from './error-log';

type State={error:Error|null};

export class ErrorBoundary extends Component<PropsWithChildren,State>{
  state:State={error:null};

  static getDerivedStateFromError(error:Error):State{
    return {error};
  }

  componentDidCatch(error:Error,info:ErrorInfo){
    logClientError(window.localStorage,error,info.componentStack??'react-boundary');
  }

  render(){
    if(this.state.error){
      return <main className="fatal-error" dir="rtl">
        <section className="sk-surface">
          <span className="eyebrow">Safe Failure</span>
          <h1>حدث خطأ غير متوقع</h1>
          <p>تم تسجيل الخطأ محليًا بدون مسح بياناتك. أعد تحميل التطبيق، وإذا تكرر الخطأ راجع قسم الصحة والتشخيص.</p>
          <button onClick={()=>window.location.reload()}>إعادة تحميل</button>
        </section>
      </main>;
    }
    return this.props.children;
  }
}
