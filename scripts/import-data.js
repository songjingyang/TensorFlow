const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// 扩展的前端技术文档数据集 (70+ 个文档)
const documents = [
  // ==================== React 文档 (15个) ====================
  {
    id: "react-hooks-useState",
    title: "useState Hook - React",
    category: "React",
    content:
      "useState 是一个 React Hook，它允许你在函数组件中添加状态。调用 useState 会返回一个数组，包含当前状态值和一个更新状态的函数。useState 的参数是初始状态值。如果初始状态需要通过复杂计算获得，你可以传入一个函数。React 会在初次渲染时调用此函数。状态更新可能是异步的，React 可能会将多个 setState 调用合并成一个调用来提高性能。",
    url: "https://react.dev/reference/react/useState",
    tags: ["hooks", "state", "react", "函数组件", "useState"],
    summary: "useState Hook 用于在函数组件中管理状态",
  },
  {
    id: "react-hooks-useEffect",
    title: "useEffect Hook - React",
    category: "React",
    content:
      "useEffect Hook 让你在函数组件中执行副作用操作。它相当于 componentDidMount、componentDidUpdate 和 componentWillUnmount 这三个生命周期函数的组合。useEffect 接收两个参数：一个函数和一个依赖数组。你可以通过返回一个清理函数来处理组件卸载时的清理工作。如果依赖数组为空，effect 只会在组件挂载和卸载时运行。",
    url: "https://react.dev/reference/react/useEffect",
    tags: ["hooks", "effect", "lifecycle", "react", "useEffect", "副作用"],
    summary: "useEffect Hook 用于在函数组件中处理副作用",
  },
  {
    id: "react-context-api",
    title: "Context API - React",
    category: "React",
    content:
      "React Context 提供了一种在组件树中传递数据的方法，无需手动在每一层传递 props。Context 主要用于共享全局数据，如主题、用户信息等。使用 createContext 创建 Context，Provider 提供值，useContext Hook 消费值。Context 应该谨慎使用，因为它会使组件复用变得困难。",
    url: "https://react.dev/reference/react/createContext",
    tags: [
      "context",
      "global-state",
      "provider",
      "consumer",
      "react",
      "createContext",
    ],
    summary: "Context API 用于在组件树中共享全局数据",
  },
  {
    id: "vue-composition-api",
    title: "Composition API - Vue 3",
    category: "Vue",
    content:
      "Composition API 是 Vue 3 中引入的一套新的 API，它提供了一种更灵活的方式来组织组件逻辑。通过 setup 函数，你可以使用 ref、reactive、computed 等函数来创建响应式数据和计算属性。Composition API 解决了 Options API 在大型组件中逻辑分散的问题，使得相关逻辑可以组织在一起。",
    url: "https://vuejs.org/guide/extras/composition-api-faq.html",
    tags: ["composition-api", "vue3", "setup", "reactive", "ref"],
    summary: "Vue 3 Composition API 提供更灵活的组件逻辑组织方式",
  },
  {
    id: "vue-reactivity-system",
    title: "Vue 响应式系统",
    category: "Vue",
    content:
      "Vue 的响应式系统是其核心特性之一。当数据发生变化时，视图会自动更新。Vue 3 使用 Proxy 来实现响应式，提供了更好的性能和更完整的语言特性支持。ref() 用于基本类型，reactive() 用于对象类型。响应式系统会自动追踪依赖关系，当响应式数据变化时，所有依赖它的计算属性和副作用函数都会重新执行。",
    url: "https://vuejs.org/guide/essentials/reactivity-fundamentals.html",
    tags: ["reactivity", "proxy", "ref", "reactive", "vue3", "响应式"],
    summary: "Vue 响应式系统自动追踪数据变化并更新视图",
  },
  {
    id: "angular-components",
    title: "Angular 组件",
    category: "Angular",
    content:
      "组件是 Angular 应用的基本构建块。每个组件包含一个 TypeScript 类、一个 HTML 模板和一个 CSS 样式表。组件通过 @Component 装饰器来定义，可以接收输入属性、发出事件、使用生命周期钩子等。组件之间可以通过属性绑定、事件绑定、服务注入等方式进行通信。Angular 使用变更检测机制来保持视图与数据的同步。",
    url: "https://angular.io/guide/component-overview",
    tags: ["components", "decorator", "template", "angular", "@Component"],
    summary: "Angular 组件是应用的基本构建单元",
  },
  {
    id: "angular-dependency-injection",
    title: "依赖注入 - Angular",
    category: "Angular",
    content:
      "Angular 的依赖注入系统是一个设计模式，用于创建和管理对象之间的依赖关系。通过 @Injectable 装饰器和构造函数注入，Angular 可以自动解析和提供服务实例。依赖注入提高了代码的可测试性和可维护性。Angular 支持多种注入器层次结构，包括根注入器、模块注入器和组件注入器。",
    url: "https://angular.io/guide/dependency-injection",
    tags: ["dependency-injection", "angular", "services", "injectable", "DI"],
    summary: "Angular 依赖注入系统用于管理组件和服务之间的依赖关系",
  },
  {
    id: "javascript-async-await",
    title: "async/await - JavaScript",
    category: "JavaScript",
    content:
      "async/await 是 JavaScript 中处理异步操作的语法糖，它基于 Promise 构建。async 函数总是返回一个 Promise，await 关键字只能在 async 函数内部使用，用于等待 Promise 的解决。async/await 使异步代码看起来像同步代码，提高了代码的可读性。错误处理可以使用 try/catch 语句。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
    tags: ["async", "await", "promise", "asynchronous", "javascript", "异步"],
    summary: "JavaScript async/await 语法简化异步编程",
  },
  {
    id: "javascript-promises",
    title: "JavaScript Promises",
    category: "JavaScript",
    content:
      "Promise 是 JavaScript 中处理异步操作的对象。Promise 有三种状态：pending（等待中）、fulfilled（已完成）、rejected（已拒绝）。Promise 提供了 then()、catch() 和 finally() 方法来处理异步结果。Promise 链可以避免回调地狱问题。Promise.all()、Promise.race()、Promise.allSettled() 等方法提供了处理多个 Promise 的能力。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    tags: ["promise", "asynchronous", "then", "catch", "javascript"],
    summary: "Promise 对象用于处理异步操作的最终完成或失败",
  },
  {
    id: "css-flexbox",
    title: "CSS Flexbox 布局",
    category: "CSS",
    content:
      "Flexbox 是一种一维布局方法，用于在容器中排列项目。通过设置 display: flex，容器成为 flex 容器，其直接子元素成为 flex 项目。Flexbox 提供了强大的对齐、分布和排序能力。主要属性包括 justify-content（主轴对齐）、align-items（交叉轴对齐）、flex-direction（主轴方向）、flex-wrap（换行）等。",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout",
    tags: ["flexbox", "layout", "alignment", "css", "flex"],
    summary: "Flexbox 提供灵活的一维布局解决方案",
  },
  {
    id: "css-grid-layout",
    title: "CSS Grid 布局",
    category: "CSS",
    content:
      "CSS Grid 是一个二维布局系统，允许你创建复杂的网格布局。通过 display: grid 属性，你可以定义网格容器，然后使用 grid-template-columns 和 grid-template-rows 来定义网格的结构。Grid 支持网格线命名、网格区域、自动放置等高级功能。Grid 和 Flexbox 可以配合使用，Grid 用于整体布局，Flexbox 用于组件内部布局。",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
    tags: ["css", "grid", "layout", "responsive", "网格"],
    summary: "CSS Grid 提供强大的二维布局能力",
  },
  {
    id: "typescript-interfaces",
    title: "TypeScript 接口",
    category: "TypeScript",
    content:
      "TypeScript 接口用于定义对象的结构和类型。接口可以描述对象的属性、方法、索引签名等。接口支持继承、可选属性、只读属性等特性，是 TypeScript 类型系统的核心概念。接口可以被类实现，也可以用于函数参数和返回值的类型注解。接口提供了代码的类型安全和更好的开发体验。",
    url: "https://www.typescriptlang.org/docs/handbook/interfaces.html",
    tags: ["typescript", "interfaces", "types", "object", "接口"],
    summary: "TypeScript 接口定义对象的结构和类型约束",
  },
  {
    id: "html-semantic-elements",
    title: "HTML 语义化元素",
    category: "HTML",
    content:
      "HTML5 引入了许多语义化元素，如 header、nav、main、article、section、aside、footer 等。这些元素不仅提供了更好的文档结构，还有助于搜索引擎优化和无障碍访问。语义化元素使HTML文档更具可读性和可维护性。正确使用语义化元素可以改善屏幕阅读器的体验，提高网站的可访问性。",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
    tags: ["html5", "semantic", "accessibility", "seo", "语义化"],
    summary: "HTML5 语义化元素提供更好的文档结构和可访问性",
  },
  {
    id: "nodejs-modules",
    title: "Node.js 模块系统",
    category: "Node.js",
    content:
      'Node.js 使用 CommonJS 模块系统，通过 require() 函数加载模块，通过 module.exports 或 exports 导出模块。Node.js 也支持 ES6 模块语法（需要 .mjs 扩展名或 package.json 中设置 "type": "module"）。模块可以是文件、目录或 npm 包。Node.js 有内置模块（如 fs、http、path）和第三方模块。',
    url: "https://nodejs.org/api/modules.html",
    tags: ["modules", "require", "exports", "commonjs", "nodejs"],
    summary: "Node.js 模块系统用于组织和重用代码",
  },
  {
    id: "webpack-module-bundling",
    title: "Webpack 模块打包",
    category: "Webpack",
    content:
      "Webpack 是一个现代 JavaScript 应用程序的静态模块打包器。它将应用程序的所有模块打包成一个或多个 bundle。Webpack 支持各种模块格式，包括 ES6 模块、CommonJS、AMD 等。Webpack 的核心概念包括入口（entry）、输出（output）、加载器（loaders）、插件（plugins）。通过配置文件可以自定义打包行为。",
    url: "https://webpack.js.org/concepts/",
    tags: ["webpack", "bundling", "modules", "build", "打包"],
    summary: "Webpack 将应用程序模块打包成优化的静态资源",
  },
  {
    id: "vite-fast-build",
    title: "Vite 快速构建工具",
    category: "Vite",
    content:
      "Vite 是一个快速的前端构建工具，它利用浏览器原生的 ES 模块支持和现代 JavaScript 工具链。Vite 提供了极快的冷启动、即时热更新和优化的生产构建。开发时使用 esbuild 进行依赖预构建，生产构建使用 Rollup。Vite 支持多种前端框架，包括 Vue、React、Svelte 等。",
    url: "https://vitejs.dev/guide/",
    tags: ["vite", "build-tool", "fast", "es-modules", "esbuild"],
    summary: "Vite 提供极快的开发体验和优化的生产构建",
  },

  // ==================== 新增 React 文档 ====================
  {
    id: "react-hooks-useMemo",
    title: "useMemo Hook - React",
    category: "React",
    content:
      "useMemo 是一个 React Hook，用于缓存计算结果。它只有在依赖项发生变化时才会重新计算值，这有助于避免在每次渲染时进行昂贵的计算。useMemo 接收一个创建函数和依赖数组，返回缓存的值。使用 useMemo 可以优化性能，但不应过度使用，因为缓存本身也有开销。适用于复杂计算、大数据处理和避免子组件不必要的重新渲染。",
    url: "https://react.dev/reference/react/useMemo",
    tags: [
      "hooks",
      "performance",
      "memoization",
      "react",
      "useMemo",
      "性能优化",
    ],
    summary: "useMemo Hook 用于缓存计算结果，避免不必要的重复计算",
  },
  {
    id: "react-hooks-useCallback",
    title: "useCallback Hook - React",
    category: "React",
    content:
      "useCallback 是一个 React Hook，用于缓存函数定义。它返回一个记忆化的回调函数，只有在依赖项发生变化时才会更新。useCallback 主要用于优化性能，避免子组件因为接收到新的函数引用而不必要地重新渲染。常用于传递给子组件的事件处理函数、传递给 useEffect 的函数等场景。与 useMemo 的区别是 useCallback 缓存函数，useMemo 缓存值。",
    url: "https://react.dev/reference/react/useCallback",
    tags: [
      "hooks",
      "performance",
      "memoization",
      "react",
      "useCallback",
      "函数缓存",
    ],
    summary: "useCallback Hook 用于缓存函数定义，避免子组件不必要的重新渲染",
  },
  {
    id: "react-hooks-useReducer",
    title: "useReducer Hook - React",
    category: "React",
    content:
      "useReducer 是一个 React Hook，用于管理复杂的状态逻辑。它是 useState 的替代方案，特别适用于状态逻辑复杂、包含多个子值或下一个状态依赖于之前状态的情况。useReducer 接收一个 reducer 函数和初始状态，返回当前状态和 dispatch 函数。reducer 函数接收当前状态和 action，返回新状态。这种模式类似于 Redux，有助于状态管理的可预测性和可测试性。",
    url: "https://react.dev/reference/react/useReducer",
    tags: ["hooks", "state", "reducer", "react", "useReducer", "状态管理"],
    summary: "useReducer Hook 用于管理复杂的状态逻辑，提供可预测的状态更新",
  },
  {
    id: "react-hooks-useRef",
    title: "useRef Hook - React",
    category: "React",
    content:
      "useRef 是一个 React Hook，用于创建一个可变的引用对象。useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数。ref 对象在组件的整个生命周期内保持不变。useRef 有两个主要用途：访问 DOM 元素和存储可变值（不会触发重新渲染）。与 useState 不同，更改 ref.current 不会触发重新渲染。常用于焦点管理、滚动控制、定时器引用等场景。",
    url: "https://react.dev/reference/react/useRef",
    tags: ["hooks", "ref", "dom", "react", "useRef", "mutable"],
    summary: "useRef Hook 用于访问 DOM 元素和存储可变值",
  },
  {
    id: "react-hooks-useContext",
    title: "useContext Hook - React",
    category: "React",
    content:
      "useContext 是一个 React Hook，用于读取和订阅组件中的 context。它接收一个 context 对象（由 React.createContext 创建）并返回该 context 的当前值。useContext 让你可以在函数组件中使用 context，而无需嵌套 Consumer 组件。当 context 的值发生变化时，使用该 context 的组件会重新渲染。useContext 必须与 Context.Provider 配合使用，用于跨组件层级传递数据。",
    url: "https://react.dev/reference/react/useContext",
    tags: [
      "hooks",
      "context",
      "global-state",
      "react",
      "useContext",
      "跨组件通信",
    ],
    summary: "useContext Hook 用于在函数组件中读取和订阅 context",
  },
  {
    id: "react-error-boundaries",
    title: "Error Boundaries - React",
    category: "React",
    content:
      "Error Boundaries 是 React 组件，用于捕获其子组件树中任何位置的 JavaScript 错误，记录这些错误，并显示备用 UI。Error Boundaries 在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。要创建 Error Boundary，需要定义 componentDidCatch 或 static getDerivedStateFromError 生命周期方法。Error Boundaries 无法捕获事件处理器、异步代码、服务端渲染和 Error Boundary 自身的错误。",
    url: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
    tags: [
      "error-handling",
      "error-boundary",
      "react",
      "错误处理",
      "componentDidCatch",
    ],
    summary: "Error Boundaries 用于捕获和处理 React 组件树中的错误",
  },
  {
    id: "react-portals",
    title: "Portals - React",
    category: "React",
    content:
      'Portals 提供了一种将子节点渲染到存在于父组件以外的 DOM 节点的方法。使用 ReactDOM.createPortal(child, container) 创建 portal。Portal 的典型用例是当父组件有 overflow: hidden 或 z-index 样式时，需要子组件能够在视觉上"跳出"其容器。常用于模态框、提示框、下拉菜单等需要脱离正常文档流的组件。虽然 portal 可以被放在 DOM 树中的任何地方，但在其他方面其行为和普通的 React 子节点一样。',
    url: "https://react.dev/reference/react-dom/createPortal",
    tags: ["portals", "dom", "modal", "react", "createPortal", "传送门"],
    summary: "Portals 允许将组件渲染到父组件 DOM 层次结构之外",
  },
  {
    id: "react-lazy-suspense",
    title: "Lazy Loading & Suspense - React",
    category: "React",
    content:
      "React.lazy 和 Suspense 用于实现组件的懒加载和代码分割。React.lazy 接收一个函数，该函数需要动态调用 import()，返回一个 Promise，该 Promise 需要 resolve 一个默认导出的 React 组件。懒加载的组件必须在 Suspense 组件内渲染，Suspense 可以指定加载指示器。这种模式有助于减少初始包大小，提高应用性能。Suspense 还可以用于数据获取，配合支持 Suspense 的数据获取库使用。",
    url: "https://react.dev/reference/react/lazy",
    tags: ["lazy", "suspense", "code-splitting", "react", "懒加载", "代码分割"],
    summary: "React.lazy 和 Suspense 用于实现组件懒加载和代码分割",
  },
  {
    id: "react-higher-order-components",
    title: "Higher-Order Components (HOC) - React",
    category: "React",
    content:
      "高阶组件（HOC）是 React 中用于复用组件逻辑的高级技巧。HOC 是一个函数，接收一个组件并返回一个新组件。HOC 不修改传入的组件，也不使用继承来复制其行为，而是通过将组件包装在容器组件中来组成新组件。HOC 是纯函数，没有副作用。常见的 HOC 包括 connect（React Redux）、withRouter（React Router）等。现在更推荐使用 Hooks 来实现逻辑复用，但 HOC 在某些场景下仍然有用。",
    url: "https://react.dev/reference/react/Component#alternatives",
    tags: ["hoc", "higher-order-component", "react", "高阶组件", "逻辑复用"],
    summary: "高阶组件（HOC）是用于复用组件逻辑的高级模式",
  },
  {
    id: "react-render-props",
    title: "Render Props - React",
    category: "React",
    content:
      "Render Props 是一种在 React 组件之间使用一个值为函数的 prop 共享代码的简单技术。具有 render prop 的组件接受一个函数，该函数返回一个 React 元素并调用它而不是实现自己的渲染逻辑。Render Props 模式让组件更加灵活和可复用，可以动态决定要渲染什么。这种模式在 React Router、Formik 等库中广泛使用。虽然 Hooks 在很多情况下可以替代 Render Props，但在某些复杂场景下 Render Props 仍然很有用。",
    url: "https://react.dev/reference/react/cloneElement#alternatives",
    tags: ["render-props", "pattern", "react", "渲染属性", "代码复用"],
    summary: "Render Props 是一种通过函数 prop 共享代码的技术",
  },
  {
    id: "react-controlled-uncontrolled",
    title: "Controlled vs Uncontrolled Components - React",
    category: "React",
    content:
      "在 React 中，表单元素可以是受控组件或非受控组件。受控组件的表单数据由 React 组件来管理，通过 state 和 onChange 事件处理器控制输入值。非受控组件的表单数据由 DOM 节点来处理，通常使用 ref 来获取表单值。受控组件提供了更多的控制和验证能力，是推荐的方式。非受控组件在某些情况下更简单，特别是在集成非 React 代码时。选择哪种方式取决于具体需求和复杂度。",
    url: "https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable",
    tags: ["controlled", "uncontrolled", "forms", "react", "表单", "受控组件"],
    summary: "受控组件和非受控组件是 React 中处理表单的两种不同方式",
  },
  {
    id: "react-reconciliation",
    title: "Reconciliation - React",
    category: "React",
    content:
      "Reconciliation 是 React 用来比较两棵元素树并确定哪些部分需要更新的算法。当组件的 props 或 state 发生变化时，React 需要决定是否更新 DOM。React 使用启发式的 O(n) 算法来解决这个问题，基于两个假设：不同类型的元素会产生不同的树；开发者可以通过 key prop 来暗示哪些子元素在不同的渲染下能保持稳定。理解 Reconciliation 有助于编写更高效的 React 代码，正确使用 key 和避免不必要的重新渲染。",
    url: "https://react.dev/learn/preserving-and-resetting-state",
    tags: [
      "reconciliation",
      "virtual-dom",
      "performance",
      "react",
      "协调",
      "虚拟DOM",
    ],
    summary: "Reconciliation 是 React 用来高效更新 DOM 的算法",
  },

  // ==================== JavaScript 文档 (10个) ====================
  {
    id: "javascript-async-await-advanced",
    title: "async/await 高级用法 - JavaScript",
    category: "JavaScript",
    content:
      "async/await 是 JavaScript 中处理异步操作的现代语法，它基于 Promise 构建。async 函数总是返回一个 Promise，await 关键字只能在 async 函数内部使用，用于等待 Promise 的解决。async/await 使异步代码看起来像同步代码，提高了代码的可读性。错误处理可以使用 try/catch 语句。支持并行执行多个异步操作，可以与 Promise.all() 结合使用。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
    tags: [
      "async",
      "await",
      "promise",
      "asynchronous",
      "javascript",
      "异步",
      "高级",
    ],
    summary: "JavaScript async/await 高级用法和最佳实践",
  },
  {
    id: "javascript-promises-advanced",
    title: "JavaScript Promises 高级特性",
    category: "JavaScript",
    content:
      "Promise 是 JavaScript 中处理异步操作的核心对象。Promise 有三种状态：pending（等待中）、fulfilled（已完成）、rejected（已拒绝）。Promise 提供了 then()、catch() 和 finally() 方法来处理异步结果。Promise 链可以避免回调地狱问题。Promise.all()、Promise.race()、Promise.allSettled()、Promise.any() 等静态方法提供了处理多个 Promise 的强大能力。支持错误传播和链式调用。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    tags: ["promise", "asynchronous", "then", "catch", "javascript", "高级"],
    summary: "Promise 对象的高级特性和静态方法",
  },
  {
    id: "javascript-es6-modules",
    title: "ES6 模块系统 - JavaScript",
    category: "JavaScript",
    content:
      "ES6 模块是 JavaScript 的官方模块系统，使用 import 和 export 语句。export 可以导出变量、函数、类等，支持命名导出和默认导出。import 用于导入其他模块的内容，支持静态导入和动态导入。模块具有自己的作用域，导出的绑定是活的。ES6 模块在编译时确定依赖关系，支持 tree shaking 优化。现代浏览器和 Node.js 都支持 ES6 模块。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
    tags: ["modules", "import", "export", "es6", "javascript", "模块"],
    summary: "ES6 模块提供了 JavaScript 的官方模块化解决方案",
  },
  {
    id: "javascript-closures",
    title: "JavaScript 闭包",
    category: "JavaScript",
    content:
      "闭包是 JavaScript 中的一个重要概念，指的是函数能够访问其外部作用域中的变量，即使在外部函数已经返回之后。闭包由函数和其周围的状态（词法环境）组成。闭包常用于数据私有化、模块模式、回调函数等场景。理解闭包有助于避免内存泄漏和理解 JavaScript 的作用域机制。闭包是 JavaScript 函数式编程的基础。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    tags: ["closures", "scope", "lexical-environment", "javascript", "闭包"],
    summary: "闭包允许函数访问其外部作用域的变量",
  },
  {
    id: "javascript-prototypes",
    title: "JavaScript 原型与原型链",
    category: "JavaScript",
    content:
      "JavaScript 是基于原型的语言，每个对象都有一个原型对象。原型链是 JavaScript 实现继承的机制，当访问对象的属性时，如果对象本身没有该属性，会沿着原型链向上查找。prototype 属性用于为构造函数添加方法和属性。__proto__ 是对象的原型引用。Object.create() 可以创建具有指定原型的对象。理解原型链对于掌握 JavaScript 面向对象编程至关重要。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain",
    tags: ["prototype", "inheritance", "prototype-chain", "javascript", "原型"],
    summary: "原型链是 JavaScript 实现继承的核心机制",
  },
  {
    id: "javascript-event-loop",
    title: "JavaScript 事件循环",
    category: "JavaScript",
    content:
      "事件循环是 JavaScript 运行时的核心机制，负责处理异步操作。JavaScript 是单线程的，但通过事件循环可以实现非阻塞的异步执行。事件循环包括调用栈、任务队列（宏任务）和微任务队列。微任务（如 Promise）的优先级高于宏任务（如 setTimeout）。理解事件循环有助于编写高效的异步代码和避免阻塞主线程。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop",
    tags: [
      "event-loop",
      "asynchronous",
      "microtask",
      "macrotask",
      "javascript",
    ],
    summary: "事件循环是 JavaScript 处理异步操作的核心机制",
  },
  {
    id: "javascript-destructuring",
    title: "JavaScript 解构赋值",
    category: "JavaScript",
    content:
      "解构赋值是 ES6 引入的语法，允许从数组或对象中提取值并赋给变量。数组解构使用方括号语法，对象解构使用花括号语法。解构支持默认值、重命名、嵌套解构等功能。解构在函数参数、变量交换、模块导入等场景中非常有用。解构赋值使代码更简洁、更易读。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
    tags: ["destructuring", "es6", "array", "object", "javascript", "解构"],
    summary: "解构赋值提供了从数组和对象中提取值的简洁语法",
  },
  {
    id: "javascript-arrow-functions",
    title: "JavaScript 箭头函数",
    category: "JavaScript",
    content:
      "箭头函数是 ES6 引入的函数定义语法，使用 => 操作符。箭头函数具有更简洁的语法，没有自己的 this、arguments、super 或 new.target。箭头函数的 this 值继承自外围作用域，这使得它们特别适合用作回调函数。箭头函数不能用作构造函数，也不能使用 yield 关键字。单表达式的箭头函数会自动返回表达式的值。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
    tags: ["arrow-functions", "es6", "this", "javascript", "箭头函数"],
    summary: "箭头函数提供了更简洁的函数定义语法",
  },
  {
    id: "javascript-classes",
    title: "JavaScript 类",
    category: "JavaScript",
    content:
      "ES6 引入了 class 语法，提供了更清晰的面向对象编程方式。类是构造函数的语法糖，支持构造函数、实例方法、静态方法、getter/setter 等。类支持继承，使用 extends 关键字和 super() 调用父类。私有字段使用 # 前缀定义。类声明不会提升，必须先声明后使用。类为 JavaScript 的面向对象编程提供了更现代的语法。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
    tags: ["classes", "es6", "oop", "inheritance", "javascript", "类"],
    summary: "ES6 类为 JavaScript 提供了现代的面向对象编程语法",
  },
  {
    id: "javascript-generators",
    title: "JavaScript 生成器",
    category: "JavaScript",
    content:
      "生成器是 ES6 引入的特殊函数，可以暂停和恢复执行。生成器函数使用 function* 语法定义，使用 yield 关键字暂停执行并返回值。生成器返回一个迭代器对象，可以通过 next() 方法控制执行。生成器支持双向通信，可以通过 next(value) 向生成器传递值。生成器常用于实现迭代器、异步编程、状态机等场景。",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator",
    tags: ["generators", "yield", "iterator", "es6", "javascript", "生成器"],
    summary: "生成器函数可以暂停和恢复执行，提供强大的控制流能力",
  },
];

async function importData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("开始导入文档数据到 Supabase...");

  try {
    // 清空现有数据
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .neq("id", "");

    if (deleteError) {
      console.warn("清空现有数据时出错:", deleteError.message);
    }

    // 插入新数据
    const { data, error } = await supabase.from("documents").insert(documents);

    if (error) {
      console.error("导入数据失败:", error);
      process.exit(1);
    }

    console.log(`成功导入 ${documents.length} 个文档到 Supabase!`);
    console.log("数据导入完成。");
  } catch (error) {
    console.error("导入过程中发生错误:", error);
    process.exit(1);
  }
}

importData();
