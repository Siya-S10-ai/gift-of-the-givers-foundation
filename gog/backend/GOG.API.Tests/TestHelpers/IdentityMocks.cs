using Microsoft.AspNetCore.Identity;
using Moq;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

public static class IdentityMocks
{
    public static Mock<UserManager<TUser>> MockUserManager<TUser>() where TUser : class
    {
        var store = new Mock<TUserStore<TUser>>();
        var mgr = new Mock<UserManager<TUser>>(store.Object,
            Mock.Of<IOptions<IdentityOptions>>(),
            Mock.Of<IPasswordHasher<TUser>>(),
            new IUserValidator<TUser>[0],
            new IPasswordValidator<TUser>[0],
            Mock.Of<ILookupNormalizer>(),
            Mock.Of<IdentityErrorDescriber>(),
            Mock.Of<IServiceProvider>(),
            Mock.Of<ILogger<UserManager<TUser>>>());

        mgr.Object.UserValidators.Clear();
        mgr.Object.PasswordValidators.Clear();

        return mgr;
    }

    public static Mock<SignInManager<TUser>> MockSignInManager<TUser>(Mock<UserManager<TUser>>userManager) where TUser : class
    {
        var contextAccessor = new Mock<IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimPrincipalFactory<TUser>>();
        return new Mock<SignInManager<IUser>>(userManager.Object,
            contextAccessor.Object,
            claimsFactory.Object,
            Mock.Of<IOptions<IdentityOptions>>(),
            Mock.Of<ILogger<SignInManager<TUser>>>(),
            Mock.Of<IAuthenticationSchemaProvider>());
    }
}
