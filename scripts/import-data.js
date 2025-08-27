const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 文档数据
const documents = [
  {
    id: 'react-hooks-useState',
    title: 'useState Hook - React',
    category: 'React',
    content: 'useState 是一个 React Hook，它允许你在函数组件中添加状态。调用 useState 会返回一个数组，包含当前状态值和一个更新状态的函数。useState 的参数是初始状态值。如果初始状态需要通过复杂计算获得，你可以传入一个函数。React 会在初次渲染时调用此函数。状态更新可能是异步的，React 可能会将多个 setState 调用合并成一个调用来提高性能。',
    url: 'https://react.dev/reference/react/useState',
    tags: ['hooks', 'state', 'react', '函数组件', 'useState'],
    summary: 'useState Hook 用于在函数组件中管理状态'
  },
  {
    id: 'react-hooks-useEffect',
    title: 'useEffect Hook - React',
    category: 'React',
    content: 'useEffect Hook 让你在函数组件中执行副作用操作。它相当于 componentDidMount、componentDidUpdate 和 componentWillUnmount 这三个生命周期函数的组合。useEffect 接收两个参数：一个函数和一个依赖数组。你可以通过返回一个清理函数来处理组件卸载时的清理工作。如果依赖数组为空，effect 只会在组件挂载和卸载时运行。',
    url: 'https://react.dev/reference/react/useEffect',
    tags: ['hooks', 'effect', 'lifecycle', 'react', 'useEffect', '副作用'],
    summary: 'useEffect Hook 用于在函数组件中处理副作用'
  },
  {
    id: 'react-context-api',
    title: 'Context API - React',
    category: 'React',
    content: 'React Context 提供了一种在组件树中传递数据的方法，无需手动在每一层传递 props。Context 主要用于共享全局数据，如主题、用户信息等。使用 createContext 创建 Context，Provider 提供值，useContext Hook 消费值。Context 应该谨慎使用，因为它会使组件复用变得困难。',
    url: 'https://react.dev/reference/react/createContext',
    tags: ['context', 'global-state', 'provider', 'consumer', 'react', 'createContext'],
    summary: 'Context API 用于在组件树中共享全局数据'
  },
  {
    id: 'vue-composition-api',
    title: 'Composition API - Vue 3',
    category: 'Vue',
    content: 'Composition API 是 Vue 3 中引入的一套新的 API，它提供了一种更灵活的方式来组织组件逻辑。通过 setup 函数，你可以使用 ref、reactive、computed 等函数来创建响应式数据和计算属性。Composition API 解决了 Options API 在大型组件中逻辑分散的问题，使得相关逻辑可以组织在一起。',
    url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
    tags: ['composition-api', 'vue3', 'setup', 'reactive', 'ref'],
    summary: 'Vue 3 Composition API 提供更灵活的组件逻辑组织方式'
  },
  {
    id: 'vue-reactivity-system',
    title: 'Vue 响应式系统',
    category: 'Vue',
    content: 'Vue 的响应式系统是其核心特性之一。当数据发生变化时，视图会自动更新。Vue 3 使用 Proxy 来实现响应式，提供了更好的性能和更完整的语言特性支持。ref() 用于基本类型，reactive() 用于对象类型。响应式系统会自动追踪依赖关系，当响应式数据变化时，所有依赖它的计算属性和副作用函数都会重新执行。',
    url: 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html',
    tags: ['reactivity', 'proxy', 'ref', 'reactive', 'vue3', '响应式'],
    summary: 'Vue 响应式系统自动追踪数据变化并更新视图'
  },
  {
    id: 'angular-components',
    title: 'Angular 组件',
    category: 'Angular',
    content: '组件是 Angular 应用的基本构建块。每个组件包含一个 TypeScript 类、一个 HTML 模板和一个 CSS 样式表。组件通过 @Component 装饰器来定义，可以接收输入属性、发出事件、使用生命周期钩子等。组件之间可以通过属性绑定、事件绑定、服务注入等方式进行通信。Angular 使用变更检测机制来保持视图与数据的同步。',
    url: 'https://angular.io/guide/component-overview',
    tags: ['components', 'decorator', 'template', 'angular', '@Component'],
    summary: 'Angular 组件是应用的基本构建单元'
  },
  {
    id: 'angular-dependency-injection',
    title: '依赖注入 - Angular',
    category: 'Angular',
    content: 'Angular 的依赖注入系统是一个设计模式，用于创建和管理对象之间的依赖关系。通过 @Injectable 装饰器和构造函数注入，Angular 可以自动解析和提供服务实例。依赖注入提高了代码的可测试性和可维护性。Angular 支持多种注入器层次结构，包括根注入器、模块注入器和组件注入器。',
    url: 'https://angular.io/guide/dependency-injection',
    tags: ['dependency-injection', 'angular', 'services', 'injectable', 'DI'],
    summary: 'Angular 依赖注入系统用于管理组件和服务之间的依赖关系'
  },
  {
    id: 'javascript-async-await',
    title: 'async/await - JavaScript',
    category: 'JavaScript',
    content: 'async/await 是 JavaScript 中处理异步操作的语法糖，它基于 Promise 构建。async 函数总是返回一个 Promise，await 关键字只能在 async 函数内部使用，用于等待 Promise 的解决。async/await 使异步代码看起来像同步代码，提高了代码的可读性。错误处理可以使用 try/catch 语句。',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
    tags: ['async', 'await', 'promise', 'asynchronous', 'javascript', '异步'],
    summary: 'JavaScript async/await 语法简化异步编程'
  },
  {
    id: 'javascript-promises',
    title: 'JavaScript Promises',
    category: 'JavaScript',
    content: 'Promise 是 JavaScript 中处理异步操作的对象。Promise 有三种状态：pending（等待中）、fulfilled（已完成）、rejected（已拒绝）。Promise 提供了 then()、catch() 和 finally() 方法来处理异步结果。Promise 链可以避免回调地狱问题。Promise.all()、Promise.race()、Promise.allSettled() 等方法提供了处理多个 Promise 的能力。',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    tags: ['promise', 'asynchronous', 'then', 'catch', 'javascript'],
    summary: 'Promise 对象用于处理异步操作的最终完成或失败'
  },
  {
    id: 'css-flexbox',
    title: 'CSS Flexbox 布局',
    category: 'CSS',
    content: 'Flexbox 是一种一维布局方法，用于在容器中排列项目。通过设置 display: flex，容器成为 flex 容器，其直接子元素成为 flex 项目。Flexbox 提供了强大的对齐、分布和排序能力。主要属性包括 justify-content（主轴对齐）、align-items（交叉轴对齐）、flex-direction（主轴方向）、flex-wrap（换行）等。',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout',
    tags: ['flexbox', 'layout', 'alignment', 'css', 'flex'],
    summary: 'Flexbox 提供灵活的一维布局解决方案'
  },
  {
    id: 'css-grid-layout',
    title: 'CSS Grid 布局',
    category: 'CSS',
    content: 'CSS Grid 是一个二维布局系统，允许你创建复杂的网格布局。通过 display: grid 属性，你可以定义网格容器，然后使用 grid-template-columns 和 grid-template-rows 来定义网格的结构。Grid 支持网格线命名、网格区域、自动放置等高级功能。Grid 和 Flexbox 可以配合使用，Grid 用于整体布局，Flexbox 用于组件内部布局。',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
    tags: ['css', 'grid', 'layout', 'responsive', '网格'],
    summary: 'CSS Grid 提供强大的二维布局能力'
  },
  {
    id: 'typescript-interfaces',
    title: 'TypeScript 接口',
    category: 'TypeScript',
    content: 'TypeScript 接口用于定义对象的结构和类型。接口可以描述对象的属性、方法、索引签名等。接口支持继承、可选属性、只读属性等特性，是 TypeScript 类型系统的核心概念。接口可以被类实现，也可以用于函数参数和返回值的类型注解。接口提供了代码的类型安全和更好的开发体验。',
    url: 'https://www.typescriptlang.org/docs/handbook/interfaces.html',
    tags: ['typescript', 'interfaces', 'types', 'object', '接口'],
    summary: 'TypeScript 接口定义对象的结构和类型约束'
  },
  {
    id: 'html-semantic-elements',
    title: 'HTML 语义化元素',
    category: 'HTML',
    content: 'HTML5 引入了许多语义化元素，如 header、nav、main、article、section、aside、footer 等。这些元素不仅提供了更好的文档结构，还有助于搜索引擎优化和无障碍访问。语义化元素使HTML文档更具可读性和可维护性。正确使用语义化元素可以改善屏幕阅读器的体验，提高网站的可访问性。',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
    tags: ['html5', 'semantic', 'accessibility', 'seo', '语义化'],
    summary: 'HTML5 语义化元素提供更好的文档结构和可访问性'
  },
  {
    id: 'nodejs-modules',
    title: 'Node.js 模块系统',
    category: 'Node.js',
    content: 'Node.js 使用 CommonJS 模块系统，通过 require() 函数加载模块，通过 module.exports 或 exports 导出模块。Node.js 也支持 ES6 模块语法（需要 .mjs 扩展名或 package.json 中设置 "type": "module"）。模块可以是文件、目录或 npm 包。Node.js 有内置模块（如 fs、http、path）和第三方模块。',
    url: 'https://nodejs.org/api/modules.html',
    tags: ['modules', 'require', 'exports', 'commonjs', 'nodejs'],
    summary: 'Node.js 模块系统用于组织和重用代码'
  },
  {
    id: 'webpack-module-bundling',
    title: 'Webpack 模块打包',
    category: 'Webpack',
    content: 'Webpack 是一个现代 JavaScript 应用程序的静态模块打包器。它将应用程序的所有模块打包成一个或多个 bundle。Webpack 支持各种模块格式，包括 ES6 模块、CommonJS、AMD 等。Webpack 的核心概念包括入口（entry）、输出（output）、加载器（loaders）、插件（plugins）。通过配置文件可以自定义打包行为。',
    url: 'https://webpack.js.org/concepts/',
    tags: ['webpack', 'bundling', 'modules', 'build', '打包'],
    summary: 'Webpack 将应用程序模块打包成优化的静态资源'
  },
  {
    id: 'vite-fast-build',
    title: 'Vite 快速构建工具',
    category: 'Vite',
    content: 'Vite 是一个快速的前端构建工具，它利用浏览器原生的 ES 模块支持和现代 JavaScript 工具链。Vite 提供了极快的冷启动、即时热更新和优化的生产构建。开发时使用 esbuild 进行依赖预构建，生产构建使用 Rollup。Vite 支持多种前端框架，包括 Vue、React、Svelte 等。',
    url: 'https://vitejs.dev/guide/',
    tags: ['vite', 'build-tool', 'fast', 'es-modules', 'esbuild'],
    summary: 'Vite 提供极快的开发体验和优化的生产构建'
  }
];

async function importData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('开始导入文档数据到 Supabase...');

  try {
    // 清空现有数据
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.warn('清空现有数据时出错:', deleteError.message);
    }

    // 插入新数据
    const { data, error } = await supabase
      .from('documents')
      .insert(documents);

    if (error) {
      console.error('导入数据失败:', error);
      process.exit(1);
    }

    console.log(`成功导入 ${documents.length} 个文档到 Supabase!`);
    console.log('数据导入完成。');
  } catch (error) {
    console.error('导入过程中发生错误:', error);
    process.exit(1);
  }
}

importData();
