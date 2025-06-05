export const initialStore=()=>{
    return{
      message: null,
      userName: null,
      userRole: null,
      token: localStorage.getItem('token') || null
    }
  }
  
  export default function storeReducer(store, action = {}) {
    switch(action.type){
      case 'set_user_info':
        return {
          ...store,
          userName: action.payload.userName,
          userRole: action.payload.userRole,
          token: action.payload.token || store.token
        };
      case 'set_token':
        localStorage.setItem('token', action.payload);
        return {
          ...store,
          token: action.payload
        };
      case 'logout':
        localStorage.removeItem('token');
        return {
          ...store,
          userName: null,
          userRole: null,
          token: null
        };
      default:
        throw Error('Unknown action.');
    }    
  }