const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// 扩展的前端技术文档数据集 (70+ 个文档)
const extendedDocuments = [
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

  // ==================== Vue 文档 (12个) ====================
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
    id: "vue-directives",
    title: "Vue 指令系统",
    category: "Vue",
    content:
      "Vue 指令是带有 v- 前缀的特殊属性，用于在模板中应用特殊的响应式行为。常用指令包括 v-if（条件渲染）、v-for（列表渲染）、v-model（双向绑定）、v-on（事件监听）、v-bind（属性绑定）等。指令可以接收参数和修饰符，提供更精确的控制。Vue 还支持自定义指令，允许开发者封装对底层 DOM 的直接操作。指令是 Vue 模板语法的重要组成部分。",
    url: "https://vuejs.org/guide/essentials/template-syntax.html#directives",
    tags: ["directives", "v-if", "v-for", "v-model", "vue", "指令"],
    summary: "Vue 指令提供了在模板中应用响应式行为的声明式方式",
  },
  {
    id: "vue-lifecycle",
    title: "Vue 生命周期",
    category: "Vue",
    content:
      "Vue 组件有完整的生命周期，从创建到销毁包含多个阶段。主要生命周期钩子包括：beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeUnmount、unmounted。在 Composition API 中，使用 onMounted、onUpdated、onUnmounted 等函数。每个生命周期钩子都有特定的用途，如 mounted 用于 DOM 操作，created 用于数据初始化，beforeUnmount 用于清理工作。理解生命周期有助于在正确的时机执行代码。",
    url: "https://vuejs.org/guide/essentials/lifecycle.html",
    tags: ["lifecycle", "mounted", "created", "vue", "生命周期", "hooks"],
    summary: "Vue 生命周期钩子让你在组件的不同阶段执行代码",
  },
  {
    id: "vue-computed-watch",
    title: "Vue 计算属性与侦听器",
    category: "Vue",
    content:
      "计算属性（computed）是基于响应式依赖进行缓存的，只有在相关响应式依赖发生改变时才会重新求值。侦听器（watch）用于观察和响应 Vue 实例上的数据变动。computed 适用于复杂逻辑的计算，watch 适用于数据变化时执行异步或开销较大的操作。在 Composition API 中，使用 computed() 和 watch() 函数。watchEffect() 会立即执行传入的函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。",
    url: "https://vuejs.org/guide/essentials/computed.html",
    tags: ["computed", "watch", "watchEffect", "vue", "计算属性", "侦听器"],
    summary: "计算属性和侦听器提供了响应数据变化的不同方式",
  },
  {
    id: "vue-components",
    title: "Vue 组件基础",
    category: "Vue",
    content:
      "组件是 Vue 最强大的功能之一，允许你将 UI 拆分为独立且可复用的代码片段。组件本质上是一个拥有预定义选项的 Vue 实例。组件可以接收 props（父组件传递的数据）、发出 events（向父组件通信）、使用 slots（内容分发）。组件注册分为全局注册和局部注册。单文件组件（SFC）是 Vue 的特色功能，将模板、脚本和样式封装在一个 .vue 文件中。组件化开发提高了代码的可维护性和复用性。",
    url: "https://vuejs.org/guide/essentials/component-basics.html",
    tags: ["components", "props", "events", "slots", "vue", "组件"],
    summary: "Vue 组件是构建用户界面的独立可复用代码片段",
  },
  {
    id: "vue-router",
    title: "Vue Router 路由管理",
    category: "Vue",
    content:
      "Vue Router 是 Vue.js 官方的路由管理器，用于构建单页面应用程序。它提供了声明式的路由配置、嵌套路由、路由参数、查询参数、路由守卫等功能。路由守卫包括全局守卫（beforeEach、afterEach）、路由独享守卫（beforeEnter）、组件内守卫（beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave）。Vue Router 4 是为 Vue 3 设计的，提供了更好的 TypeScript 支持和 Composition API 集成。",
    url: "https://router.vuejs.org/",
    tags: ["router", "navigation", "spa", "vue-router", "vue", "路由"],
    summary: "Vue Router 为 Vue.js 应用提供客户端路由功能",
  },
  {
    id: "vue-pinia",
    title: "Pinia 状态管理",
    category: "Vue",
    content:
      "Pinia 是 Vue 的官方状态管理库，是 Vuex 的继任者。Pinia 提供了更简单的 API、更好的 TypeScript 支持、模块化设计和开发工具支持。Store 是用 defineStore() 定义的，可以包含 state、getters 和 actions。Pinia 支持多个 store，每个 store 都是独立的。在 Composition API 中，可以直接在组件中使用 store。Pinia 还支持插件系统，可以扩展 store 的功能。相比 Vuex，Pinia 更轻量、更直观。",
    url: "https://pinia.vuejs.org/",
    tags: ["pinia", "state-management", "store", "vuex", "vue", "状态管理"],
    summary: "Pinia 是 Vue 的现代化状态管理解决方案",
  },
  {
    id: "vue-teleport",
    title: "Vue Teleport 传送",
    category: "Vue",
    content:
      'Teleport 是 Vue 3 的新功能，允许我们将组件的一部分模板"传送"到该组件的 DOM 结构外的其他位置。这对于模态框、通知、下拉菜单等需要脱离当前组件层级的元素非常有用。使用 <Teleport to="selector"> 可以将内容传送到指定的 DOM 节点。Teleport 不会影响组件的逻辑关系，只是改变了渲染位置。可以使用 disabled 属性来条件性地启用或禁用传送功能。',
    url: "https://vuejs.org/guide/built-ins/teleport.html",
    tags: ["teleport", "portal", "modal", "vue3", "vue", "传送"],
    summary: "Teleport 允许将组件内容渲染到 DOM 树的其他位置",
  },
  {
    id: "vue-transition",
    title: "Vue 过渡与动画",
    category: "Vue",
    content:
      "Vue 提供了强大的过渡和动画系统。<Transition> 组件可以为单个元素或组件的进入和离开添加过渡效果。<TransitionGroup> 用于列表过渡。Vue 会自动检测目标元素是否应用了 CSS 过渡或动画，并在恰当的时机添加/删除 CSS 类名。过渡类名包括 v-enter-from、v-enter-active、v-enter-to、v-leave-from、v-leave-active、v-leave-to。还可以使用 JavaScript 钩子来实现更复杂的动画效果。",
    url: "https://vuejs.org/guide/built-ins/transition.html",
    tags: ["transition", "animation", "css", "vue", "过渡", "动画"],
    summary: "Vue 过渡系统为元素的进入和离开提供动画效果",
  },
  {
    id: "vue-provide-inject",
    title: "Vue Provide/Inject 依赖注入",
    category: "Vue",
    content:
      "provide 和 inject 是 Vue 的依赖注入系统，用于在组件树中传递数据，而不需要通过每一层组件手动传递 props。父组件使用 provide 选项提供数据，子孙组件使用 inject 选项注入数据。在 Composition API 中，使用 provide() 和 inject() 函数。provide/inject 主要用于开发高阶组件或组件库。为了保证注入值的响应性，需要使用 ref 或 reactive。这种模式类似于 React 的 Context API。",
    url: "https://vuejs.org/guide/components/provide-inject.html",
    tags: ["provide", "inject", "dependency-injection", "vue", "依赖注入"],
    summary: "Provide/Inject 实现跨组件层级的数据传递",
  },
  {
    id: "vue-custom-directives",
    title: "Vue 自定义指令",
    category: "Vue",
    content:
      "除了内置指令，Vue 还允许注册自定义指令。自定义指令主要用于对底层 DOM 元素进行低级操作。指令定义对象可以提供几个钩子函数：created、beforeMount、mounted、beforeUpdate、updated、beforeUnmount、unmounted。每个钩子都会接收指令所绑定的元素、绑定对象等参数。自定义指令应该仅用于 DOM 操作，对于复杂逻辑应该使用组件。全局指令使用 app.directive() 注册，局部指令在组件的 directives 选项中定义。",
    url: "https://vuejs.org/guide/reusability/custom-directives.html",
    tags: ["custom-directives", "dom", "vue", "自定义指令", "directive"],
    summary: "自定义指令允许对 DOM 元素进行低级操作的封装",
  },
];
