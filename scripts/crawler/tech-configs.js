/**
 * 各技术栈官方文档的爬取配置
 */
const techConfigs = {
  react: {
    name: 'React',
    baseUrl: 'https://react.dev',
    category: 'React',
    pages: [
      // React Hooks
      { url: 'https://react.dev/reference/react/useState', priority: 'high' },
      { url: 'https://react.dev/reference/react/useEffect', priority: 'high' },
      { url: 'https://react.dev/reference/react/useContext', priority: 'high' },
      { url: 'https://react.dev/reference/react/useReducer', priority: 'high' },
      { url: 'https://react.dev/reference/react/useMemo', priority: 'high' },
      { url: 'https://react.dev/reference/react/useCallback', priority: 'high' },
      { url: 'https://react.dev/reference/react/useRef', priority: 'high' },
      { url: 'https://react.dev/reference/react/useImperativeHandle', priority: 'medium' },
      { url: 'https://react.dev/reference/react/useLayoutEffect', priority: 'medium' },
      { url: 'https://react.dev/reference/react/useDebugValue', priority: 'low' },
      
      // React 核心概念
      { url: 'https://react.dev/learn/describing-the-ui', priority: 'high' },
      { url: 'https://react.dev/learn/adding-interactivity', priority: 'high' },
      { url: 'https://react.dev/learn/managing-state', priority: 'high' },
      { url: 'https://react.dev/learn/escape-hatches', priority: 'medium' },
      
      // React 组件
      { url: 'https://react.dev/reference/react/Component', priority: 'medium' },
      { url: 'https://react.dev/reference/react/PureComponent', priority: 'medium' },
      { url: 'https://react.dev/reference/react/memo', priority: 'high' },
      { url: 'https://react.dev/reference/react/forwardRef', priority: 'medium' },
      { url: 'https://react.dev/reference/react/lazy', priority: 'high' },
      { url: 'https://react.dev/reference/react/Suspense', priority: 'high' },
      
      // React DOM
      { url: 'https://react.dev/reference/react-dom/createPortal', priority: 'medium' },
      { url: 'https://react.dev/reference/react-dom/flushSync', priority: 'low' }
    ],
    config: {
      contentSelector: 'main',
      waitTime: 2000
    }
  },

  vue: {
    name: 'Vue.js',
    baseUrl: 'https://vuejs.org',
    category: 'Vue',
    pages: [
      // Vue 3 基础
      { url: 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/computed.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/watchers.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/lifecycle.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/template-syntax.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/event-handling.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/essentials/forms.html', priority: 'high' },
      
      // Composition API
      { url: 'https://vuejs.org/guide/extras/composition-api-faq.html', priority: 'high' },
      { url: 'https://vuejs.org/api/composition-api-setup.html', priority: 'high' },
      { url: 'https://vuejs.org/api/reactivity-core.html', priority: 'high' },
      { url: 'https://vuejs.org/api/reactivity-utilities.html', priority: 'medium' },
      
      // 组件
      { url: 'https://vuejs.org/guide/essentials/component-basics.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/components/props.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/components/events.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/components/slots.html', priority: 'high' },
      { url: 'https://vuejs.org/guide/components/provide-inject.html', priority: 'medium' },
      
      // 高级特性
      { url: 'https://vuejs.org/guide/built-ins/teleport.html', priority: 'medium' },
      { url: 'https://vuejs.org/guide/built-ins/transition.html', priority: 'medium' },
      { url: 'https://vuejs.org/guide/reusability/custom-directives.html', priority: 'medium' }
    ],
    config: {
      contentSelector: '.content',
      waitTime: 2000
    }
  },

  angular: {
    name: 'Angular',
    baseUrl: 'https://angular.io',
    category: 'Angular',
    pages: [
      // Angular 基础
      { url: 'https://angular.io/guide/component-overview', priority: 'high' },
      { url: 'https://angular.io/guide/template-syntax', priority: 'high' },
      { url: 'https://angular.io/guide/lifecycle-hooks', priority: 'high' },
      { url: 'https://angular.io/guide/component-interaction', priority: 'high' },
      
      // 服务和依赖注入
      { url: 'https://angular.io/guide/dependency-injection', priority: 'high' },
      { url: 'https://angular.io/guide/creating-injectable-service', priority: 'high' },
      { url: 'https://angular.io/guide/hierarchical-dependency-injection', priority: 'medium' },
      
      // 指令
      { url: 'https://angular.io/guide/built-in-directives', priority: 'high' },
      { url: 'https://angular.io/guide/structural-directives', priority: 'medium' },
      { url: 'https://angular.io/guide/attribute-directives', priority: 'medium' },
      
      // 表单
      { url: 'https://angular.io/guide/forms-overview', priority: 'high' },
      { url: 'https://angular.io/guide/reactive-forms', priority: 'high' },
      { url: 'https://angular.io/guide/form-validation', priority: 'high' },
      
      // HTTP 和路由
      { url: 'https://angular.io/guide/http', priority: 'high' },
      { url: 'https://angular.io/guide/router', priority: 'high' },
      { url: 'https://angular.io/guide/router-tutorial', priority: 'medium' },
      
      // 管道
      { url: 'https://angular.io/guide/pipes', priority: 'medium' },
      { url: 'https://angular.io/guide/pipes-custom', priority: 'medium' }
    ],
    config: {
      contentSelector: '.content',
      waitTime: 2000
    }
  },

  javascript: {
    name: 'JavaScript (MDN)',
    baseUrl: 'https://developer.mozilla.org',
    category: 'JavaScript',
    pages: [
      // ES6+ 特性
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules', priority: 'high' },
      
      // 核心概念
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator', priority: 'medium' },
      
      // Web APIs
      { url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API', priority: 'medium' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', priority: 'medium' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API', priority: 'medium' }
    ],
    config: {
      contentSelector: '.main-page-content',
      waitTime: 2000
    }
  },

  typescript: {
    name: 'TypeScript',
    baseUrl: 'https://www.typescriptlang.org',
    category: 'TypeScript',
    pages: [
      { url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html', priority: 'high' },
      { url: 'https://www.typescriptlang.org/docs/handbook/decorators.html', priority: 'medium' },
      { url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html', priority: 'medium' }
    ],
    config: {
      contentSelector: '.markdown',
      waitTime: 2000
    }
  },

  css: {
    name: 'CSS (MDN)',
    baseUrl: 'https://developer.mozilla.org',
    category: 'CSS',
    pages: [
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Variables', priority: 'medium' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries', priority: 'high' },
      { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transforms', priority: 'medium' }
    ],
    config: {
      contentSelector: '.main-page-content',
      waitTime: 2000
    }
  }
};

/**
 * 获取指定技术栈的配置
 */
function getTechConfig(techName) {
  return techConfigs[techName.toLowerCase()];
}

/**
 * 获取所有技术栈配置
 */
function getAllTechConfigs() {
  return techConfigs;
}

/**
 * 根据优先级过滤页面
 */
function filterPagesByPriority(config, priority = 'high') {
  return {
    ...config,
    pages: config.pages.filter(page => page.priority === priority)
  };
}

/**
 * 获取高优先级页面的URL列表
 */
function getHighPriorityUrls(techName) {
  const config = getTechConfig(techName);
  if (!config) return [];
  
  return config.pages
    .filter(page => page.priority === 'high')
    .map(page => ({
      url: page.url,
      config: config.config
    }));
}

module.exports = {
  techConfigs,
  getTechConfig,
  getAllTechConfigs,
  filterPagesByPriority,
  getHighPriorityUrls
};
