export const pickyWikiReducer = (state, action) => {
    switch (action.type) {
        case 'SET_WIKIPEDIA_USER': {
            return { ...state, wikipediaUser: action.userName }
        }
        case 'ZOOM_IN': {
            return { ...state, zoom: state['zoom'] + 0.25 }
        }
        case 'ZOOM_OUT': {
            return { ...state, zoom: state['zoom'] - 0.25 }
        }
        case 'SET_IS_UPDATING': {
            return { ...state, isUpdating: action.isUpdating }
        }
        case 'SET_CUSTOM_AUTH_LOADING': {
            return { ...state, customAuthLoading: false }
        }
        case 'SET_PROGRESS': {
            return { ...state, progress: action.progress }
        }
    }
}