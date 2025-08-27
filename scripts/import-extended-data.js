const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 扩展的前端技术文档数据集 (70+ 个文档)
const extendedDocuments = [
  // ==================== React 文档 (15个) ====================
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
    id: 'react-hooks-useMemo',
    title: 'useMemo Hook - React',
    category: 'React',
    content: 'useMemo 是一个 React Hook，用于缓存计算结果。它只有在依赖项发生变化时才会重新计算值，这有助于避免在每次渲染时进行昂贵的计算。useMemo 接收一个创建函数和依赖数组，返回缓存的值。使用 useMemo 可以优化性能，但不应过度使用，因为缓存本身也有开销。适用于复杂计算、大数据处理和避免子组件不必要的重新渲染。',
    url: 'https://react.dev/reference/react/useMemo',
    tags: ['hooks', 'performance', 'memoization', 'react', 'useMemo', '性能优化'],
    summary: 'useMemo Hook 用于缓存计算结果，避免不必要的重复计算'
  },
  {
    id: 'react-hooks-useCallback',
    title: 'useCallback Hook - React',
    category: 'React',
    content: 'useCallback 是一个 React Hook，用于缓存函数定义。它返回一个记忆化的回调函数，只有在依赖项发生变化时才会更新。useCallback 主要用于优化性能，避免子组件因为接收到新的函数引用而不必要地重新渲染。常用于传递给子组件的事件处理函数、传递给 useEffect 的函数等场景。与 useMemo 的区别是 useCallback 缓存函数，useMemo 缓存值。',
    url: 'https://react.dev/reference/react/useCallback',
    tags: ['hooks', 'performance', 'memoization', 'react', 'useCallback', '函数缓存'],
    summary: 'useCallback Hook 用于缓存函数定义，避免子组件不必要的重新渲染'
  },
  {
    id: 'react-hooks-useReducer',
    title: 'useReducer Hook - React',
    category: 'React',
    content: 'useReducer 是一个 React Hook，用于管理复杂的状态逻辑。它是 useState 的替代方案，特别适用于状态逻辑复杂、包含多个子值或下一个状态依赖于之前状态的情况。useReducer 接收一个 reducer 函数和初始状态，返回当前状态和 dispatch 函数。reducer 函数接收当前状态和 action，返回新状态。这种模式类似于 Redux，有助于状态管理的可预测性和可测试性。',
    url: 'https://react.dev/reference/react/useReducer',
    tags: ['hooks', 'state', 'reducer', 'react', 'useReducer', '状态管理'],
    summary: 'useReducer Hook 用于管理复杂的状态逻辑，提供可预测的状态更新'
  },
  {
    id: 'react-hooks-useRef',
    title: 'useRef Hook - React',
    category: 'React',
    content: 'useRef 是一个 React Hook，用于创建一个可变的引用对象。useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数。ref 对象在组件的整个生命周期内保持不变。useRef 有两个主要用途：访问 DOM 元素和存储可变值（不会触发重新渲染）。与 useState 不同，更改 ref.current 不会触发重新渲染。常用于焦点管理、滚动控制、定时器引用等场景。',
    url: 'https://react.dev/reference/react/useRef',
    tags: ['hooks', 'ref', 'dom', 'react', 'useRef', 'mutable'],
    summary: 'useRef Hook 用于访问 DOM 元素和存储可变值'
  },
  {
    id: 'react-hooks-useContext',
    title: 'useContext Hook - React',
    category: 'React',
    content: 'useContext 是一个 React Hook，用于读取和订阅组件中的 context。它接收一个 context 对象（由 React.createContext 创建）并返回该 context 的当前值。useContext 让你可以在函数组件中使用 context，而无需嵌套 Consumer 组件。当 context 的值发生变化时，使用该 context 的组件会重新渲染。useContext 必须与 Context.Provider 配合使用，用于跨组件层级传递数据。',
    url: 'https://react.dev/reference/react/useContext',
    tags: ['hooks', 'context', 'global-state', 'react', 'useContext', '跨组件通信'],
    summary: 'useContext Hook 用于在函数组件中读取和订阅 context'
  },
  {
    id: 'react-error-boundaries',
    title: 'Error Boundaries - React',
    category: 'React',
    content: 'Error Boundaries 是 React 组件，用于捕获其子组件树中任何位置的 JavaScript 错误，记录这些错误，并显示备用 UI。Error Boundaries 在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。要创建 Error Boundary，需要定义 componentDidCatch 或 static getDerivedStateFromError 生命周期方法。Error Boundaries 无法捕获事件处理器、异步代码、服务端渲染和 Error Boundary 自身的错误。',
    url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary',
    tags: ['error-handling', 'error-boundary', 'react', '错误处理', 'componentDidCatch'],
    summary: 'Error Boundaries 用于捕获和处理 React 组件树中的错误'
  },
  {
    id: 'react-portals',
    title: 'Portals - React',
    category: 'React',
    content: 'Portals 提供了一种将子节点渲染到存在于父组件以外的 DOM 节点的方法。使用 ReactDOM.createPortal(child, container) 创建 portal。Portal 的典型用例是当父组件有 overflow: hidden 或 z-index 样式时，需要子组件能够在视觉上"跳出"其容器。常用于模态框、提示框、下拉菜单等需要脱离正常文档流的组件。虽然 portal 可以被放在 DOM 树中的任何地方，但在其他方面其行为和普通的 React 子节点一样。',
    url: 'https://react.dev/reference/react-dom/createPortal',
    tags: ['portals', 'dom', 'modal', 'react', 'createPortal', '传送门'],
    summary: 'Portals 允许将组件渲染到父组件 DOM 层次结构之外'
  },
  {
    id: 'react-lazy-suspense',
    title: 'Lazy Loading & Suspense - React',
    category: 'React',
    content: 'React.lazy 和 Suspense 用于实现组件的懒加载和代码分割。React.lazy 接收一个函数，该函数需要动态调用 import()，返回一个 Promise，该 Promise 需要 resolve 一个默认导出的 React 组件。懒加载的组件必须在 Suspense 组件内渲染，Suspense 可以指定加载指示器。这种模式有助于减少初始包大小，提高应用性能。Suspense 还可以用于数据获取，配合支持 Suspense 的数据获取库使用。',
    url: 'https://react.dev/reference/react/lazy',
    tags: ['lazy', 'suspense', 'code-splitting', 'react', '懒加载', '代码分割'],
    summary: 'React.lazy 和 Suspense 用于实现组件懒加载和代码分割'
  },
  {
    id: 'react-higher-order-components',
    title: 'Higher-Order Components (HOC) - React',
    category: 'React',
    content: '高阶组件（HOC）是 React 中用于复用组件逻辑的高级技巧。HOC 是一个函数，接收一个组件并返回一个新组件。HOC 不修改传入的组件，也不使用继承来复制其行为，而是通过将组件包装在容器组件中来组成新组件。HOC 是纯函数，没有副作用。常见的 HOC 包括 connect（React Redux）、withRouter（React Router）等。现在更推荐使用 Hooks 来实现逻辑复用，但 HOC 在某些场景下仍然有用。',
    url: 'https://react.dev/reference/react/Component#alternatives',
    tags: ['hoc', 'higher-order-component', 'react', '高阶组件', '逻辑复用'],
    summary: '高阶组件（HOC）是用于复用组件逻辑的高级模式'
  },
  {
    id: 'react-render-props',
    title: 'Render Props - React',
    category: 'React',
    content: 'Render Props 是一种在 React 组件之间使用一个值为函数的 prop 共享代码的简单技术。具有 render prop 的组件接受一个函数，该函数返回一个 React 元素并调用它而不是实现自己的渲染逻辑。Render Props 模式让组件更加灵活和可复用，可以动态决定要渲染什么。这种模式在 React Router、Formik 等库中广泛使用。虽然 Hooks 在很多情况下可以替代 Render Props，但在某些复杂场景下 Render Props 仍然很有用。',
    url: 'https://react.dev/reference/react/cloneElement#alternatives',
    tags: ['render-props', 'pattern', 'react', '渲染属性', '代码复用'],
    summary: 'Render Props 是一种通过函数 prop 共享代码的技术'
  },
  {
    id: 'react-controlled-uncontrolled',
    title: 'Controlled vs Uncontrolled Components - React',
    category: 'React',
    content: '在 React 中，表单元素可以是受控组件或非受控组件。受控组件的表单数据由 React 组件来管理，通过 state 和 onChange 事件处理器控制输入值。非受控组件的表单数据由 DOM 节点来处理，通常使用 ref 来获取表单值。受控组件提供了更多的控制和验证能力，是推荐的方式。非受控组件在某些情况下更简单，特别是在集成非 React 代码时。选择哪种方式取决于具体需求和复杂度。',
    url: 'https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable',
    tags: ['controlled', 'uncontrolled', 'forms', 'react', '表单', '受控组件'],
    summary: '受控组件和非受控组件是 React 中处理表单的两种不同方式'
  },
  {
    id: 'react-reconciliation',
    title: 'Reconciliation - React',
    category: 'React',
    content: 'Reconciliation 是 React 用来比较两棵元素树并确定哪些部分需要更新的算法。当组件的 props 或 state 发生变化时，React 需要决定是否更新 DOM。React 使用启发式的 O(n) 算法来解决这个问题，基于两个假设：不同类型的元素会产生不同的树；开发者可以通过 key prop 来暗示哪些子元素在不同的渲染下能保持稳定。理解 Reconciliation 有助于编写更高效的 React 代码，正确使用 key 和避免不必要的重新渲染。',
    url: 'https://react.dev/learn/preserving-and-resetting-state',
    tags: ['reconciliation', 'virtual-dom', 'performance', 'react', '协调', '虚拟DOM'],
    summary: 'Reconciliation 是 React 用来高效更新 DOM 的算法'
  }
];
