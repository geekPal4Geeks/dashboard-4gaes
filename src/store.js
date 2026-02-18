export const ALLOWED_ACADEMIES = [6, 7];

export const initialStore = () => ({
  message: null,
  userName: null,
  userRole: null,
  userAcademies: [],
  activeAcademy: null,
  token: localStorage.getItem('token') || null,
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_user_info':
      return {
        ...store,
        userName: action.payload.userName,
        userRole: action.payload.userRole,
        userAcademies: action.payload.userAcademies || store.userAcademies,
        activeAcademy: action.payload.activeAcademy || store.activeAcademy,
        token: action.payload.token || store.token,
      };
    case 'set_active_academy':
      return {
        ...store,
        activeAcademy: action.payload,
        userRole: action.payload.role,
      };
    case 'set_token':
      localStorage.setItem('token', action.payload);
      return {
        ...store,
        token: action.payload,
      };
    case 'logout':
      localStorage.removeItem('token');
      return {
        ...store,
        userName: null,
        userRole: null,
        userAcademies: [],
        activeAcademy: null,
        token: null,
      };
    default:
      throw Error('Unknown action.');
  }
}