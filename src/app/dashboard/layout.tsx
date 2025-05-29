export default function DashboardLayout({ 
    children 
}: { children:  React.ReactNode }) {
  return <section className="dashboard-wrapper">
    {
    children
    }
    </section>;
}
