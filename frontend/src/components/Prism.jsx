import FloatingLines from './FloatingLines';

const Prism = ({
  enabledWaves = ['middle', 'bottom', 'top'],
  lineCount = [8, 8, 8],
  lineDistance = [87.5, 87.5, 87.5],
  bendRadius = 8,
  bendStrength = -15,
  interactive = true,
  parallax = true,
  animationSpeed = 1.2,
  mouseDamping = 0.1,
  mixBlendMode = 'screen'
}) => {

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <FloatingLines 
        enabledWaves={enabledWaves}
        lineCount={lineCount}
        lineDistance={lineDistance}
        bendRadius={bendRadius}
        bendStrength={bendStrength}
        interactive={interactive}
        parallax={parallax}
        animationSpeed={animationSpeed}
        mouseDamping={mouseDamping}
        mixBlendMode={mixBlendMode}
      />
    </div>
  );
};

export default Prism;
