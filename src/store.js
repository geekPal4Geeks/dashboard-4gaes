export const initialStore=()=>{
    return{
      message: null,
      userName: null,
      userRole: null
    }
  }
  
  export default function storeReducer(store, action = {}) {
    switch(action.type){
      case 'set_user_info':
        return {
          ...store,
          userName: action.payload.userName,
          userRole: action.payload.userRole,
        };
      case 'logout':
        return {
          ...store,
          userName: null,
          userRole: null,
        };
      default:
        throw Error('Unknown action.');
    }    
  }