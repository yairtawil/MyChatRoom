//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MyChatRoom.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Message
    {
        public int Id { get; set; }
        public string text { get; set; }
        public Nullable<int> from_id { get; set; }
        public Nullable<int> to_id { get; set; }
        public bool read { get; set; }
    
        public virtual User User { get; set; }
        public virtual User User1 { get; set; }
    }
}
