function Section({ title, icon: Icon, children }) {
  return (
    <section className="category">
      <h2 className="category-title">
        {Icon && <Icon size={20} />}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default Section;