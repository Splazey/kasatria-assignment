// expansion on hover (see App.jsx)
export default function AboutBubble() {
  return (
    <div className="about-bubble">
      <div className="about-icon">i</div>
      <div className="about-content">
        <h3>About</h3>
        <p>This is an internship preliminary assignment task result, created using React and Three.js. <br/><br/> Made by Aiham Ammar. <br/><br/> I tried to follow the requirements as closely as possible, while ensuring that the prototype is easy to understand, navigate, and is easily scalable in cases where new entries are added to the sheet. <br/><br/> Hope you like it 😇</p>
        
        <a // source code button 
          className="about-link"
          href="https://github.com/Splazey/kasatria-assignment"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get the source code here 💻
        </a>
        <br/>
        <a // .csv data button
          className="about-link"
          href="https://docs.google.com/spreadsheets/d/1ZkxTIHZ1PeLd9DbhIk4-N0e8X0MJM3YDKRY3bzEX6X8/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get the CSV sheet here 📄
        </a>
      </div>
    </div>
  );
}
