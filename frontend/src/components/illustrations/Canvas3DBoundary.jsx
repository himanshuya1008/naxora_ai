import { Component } from 'react';

// Dedicated to AiCoreScene.jsx specifically — WebGL context creation can
// legitimately fail (old GPU, disabled hardware acceleration, headless
// environments) and that must never be able to take down the marketing
// homepage. Deliberately silent (renders `fallback`, not an error message):
// this guards a decorative hero visual, not a real feature, so the
// full-UI ErrorBoundary.jsx (icon + "try again" + "go home") would be the
// wrong scale of response to a purely cosmetic failure.
export default class Canvas3DBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('[Canvas3DBoundary] 3D hero scene failed, falling back to static art:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
